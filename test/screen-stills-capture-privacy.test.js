const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const Module = require('node:module')
const { EventEmitter } = require('node:events')

const CAPTURE_BUFFER = Buffer.from('privacy-test-capture')

const resetRecorderModule = () => {
  const resolved = require.resolve('../src/screen-stills/recorder')
  delete require.cache[resolved]
}

const createDeterministicLowPowerModeMonitor = () => ({
  start: () => {},
  stop: () => {},
  on: () => {},
  off: () => {},
  isLowPowerModeEnabled: () => false
})

const createMockSource = () => ({
  id: 'screen:1',
  display_id: '1',
  thumbnail: {
    toPNG: () => Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    toDataURL: () => 'data:image/png;base64,iVBORw0KGgo=',
    getSize: () => ({ width: 640, height: 480 })
  }
})

const setupRecorderTest = ({
  blacklistedApps = [],
  windowSnapshots = [],
  logger = null
} = {}) => {
  resetRecorderModule()

  const ipcMain = new EventEmitter()
  const queueEnqueues = []
  let captureCalls = 0
  let detectCalls = 0

  function createWebContents() {
    const webContents = new EventEmitter()
    webContents.getURL = () => 'file://stills.html'
    webContents.send = (channel, payload) => {
      if (channel === 'screen-stills:start') {
        process.nextTick(() => {
          ipcMain.emit('screen-stills:status', {}, {
            requestId: payload.requestId,
            status: 'started'
          })
        })
      }

      if (channel === 'screen-stills:stop') {
        process.nextTick(() => {
          ipcMain.emit('screen-stills:status', {}, {
            requestId: payload.requestId,
            status: 'stopped'
          })
        })
      }

      if (channel === 'screen-stills:capture') {
        captureCalls += 1
        process.nextTick(() => {
          ipcMain.emit('screen-stills:status', {}, {
            requestId: payload.requestId,
            status: 'captured',
            imageBuffer: CAPTURE_BUFFER
          })
        })
      }
    }
    return webContents
  }

  function BrowserWindowStub() {
    this.webContents = createWebContents()
    this.loadFile = () => {
      process.nextTick(() => {
        this.webContents.emit('did-finish-load')
        ipcMain.emit('screen-stills:ready', { sender: this.webContents })
      })
    }
    this.on = () => {}
    this.isDestroyed = () => false
    this.destroy = () => {}
  }

  const stubElectron = {
    BrowserWindow: BrowserWindowStub,
    desktopCapturer: {
      getSources: async () => [createMockSource()]
    },
    ipcMain,
    screen: {
      getAllDisplays: () => [{ id: 1, bounds: { width: 1000, height: 800 }, scaleFactor: 1 }],
      getPrimaryDisplay: () => ({ id: 1, bounds: { width: 1000, height: 800 }, scaleFactor: 1 })
    },
    app: { getVersion: () => 'test' }
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'familiar-capture-privacy-'))
  const originalLoad = Module._load
  Module._load = function (request, parent, isMain) {
    if (request === 'electron') {
      return stubElectron
    }
    if (request === '../screen-capture/permissions') {
      return { isScreenRecordingPermissionGranted: () => true }
    }
    if (request === './session-store') {
      return {
        createSessionStore: ({ contextFolderPath }) => ({
          sessionId: 'session-test',
          sessionDir: path.join(contextFolderPath, 'familiar', 'stills', 'session-test'),
          nextCaptureFile: (capturedAt) => ({ fileName: 'capture.webp', capturedAt })
        })
      }
    }
    if (request === './stills-queue') {
      return {
        createStillsQueue: () => ({
          enqueueCapture: (payload) => queueEnqueues.push(payload),
          close: () => {}
        })
      }
    }
    return originalLoad.call(this, request, parent, isMain)
  }

  const cleanup = () => {
    Module._load = originalLoad
    resetRecorderModule()
    fs.rmSync(tempDir, { recursive: true, force: true })
  }

  const createRecorder = () => {
    const { createRecorder } = require('../src/screen-stills/recorder')
    return createRecorder({
      logger: logger || { log: () => {}, warn: () => {}, error: () => {} },
      intervalSeconds: 1,
      lowPowerModeMonitor: createDeterministicLowPowerModeMonitor(),
      loadSettingsImpl: () => ({
        capturePrivacy: {
          blacklistedApps
        }
      }),
      createActiveWindowDetectorImpl: () => ({
        detectWindowCandidates: async () => {
          const next = windowSnapshots[detectCalls] || []
          detectCalls += 1
          return next
        },
        resolveBinaryPath: async () => '/tmp/list-on-screen-apps'
      })
    })
  }

  return {
    tempDir,
    queueEnqueues,
    getCaptureCalls: () => captureCalls,
    cleanup,
    createRecorder
  }
}

test('recorder skips capture before renderer work when a blacklisted app is already visible', async () => {
  const harness = setupRecorderTest({
    blacklistedApps: [{ bundleId: 'com.apple.MobileSMS', name: 'Messages' }],
    windowSnapshots: [[{ name: 'Messages', bundleId: 'com.apple.MobileSMS', active: true }]]
  })

  try {
    const recorder = harness.createRecorder()
    const result = await recorder.start({ contextFolderPath: harness.tempDir })

    assert.equal(result.ok, true)
    assert.equal(harness.getCaptureCalls(), 0)
    assert.equal(harness.queueEnqueues.length, 0)
    assert.equal(fs.existsSync(path.join(harness.tempDir, 'familiar', 'stills', 'session-test', 'capture.webp')), false)

    await recorder.stop({ reason: 'test' })
  } finally {
    harness.cleanup()
  }
})

test('recorder logs full blacklisted app skip details without collapsing nested objects', async () => {
  const logMessages = []
  const harness = setupRecorderTest({
    blacklistedApps: [{ bundleId: 'com.apple.MobileSMS', name: 'Messages' }],
    windowSnapshots: [[{ name: 'Messages', bundleId: 'com.apple.MobileSMS', title: 'Inbox', active: true }]],
    logger: {
      log: (message) => logMessages.push(message),
      warn: () => {},
      error: () => {}
    }
  })

  try {
    const recorder = harness.createRecorder()
    const result = await recorder.start({ contextFolderPath: harness.tempDir })

    assert.equal(result.ok, true)
    const skipLog = logMessages.find((message) => message.includes('Skipped still capture due to blacklisted visible app'))
    assert.ok(skipLog)
    assert.match(skipLog, /blacklistedApp:\s*\{\s*bundleId:\s*'com\.apple\.MobileSMS'/)
    assert.match(skipLog, /visibleWindow:\s*\{\s*bundleId:\s*'com\.apple\.MobileSMS'/)
    assert.doesNotMatch(skipLog, /\[Object\]/)

    await recorder.stop({ reason: 'test' })
  } finally {
    harness.cleanup()
  }
})

test('recorder drops encoded bytes after capture when a blacklisted app becomes visible', async () => {
  const harness = setupRecorderTest({
    blacklistedApps: [{ bundleId: 'com.apple.MobileSMS', name: 'Messages' }],
    windowSnapshots: [
      [{ name: 'Code', bundleId: 'com.microsoft.VSCode', active: true }],
      [{ name: 'Messages', bundleId: 'com.apple.MobileSMS', active: true }]
    ]
  })

  try {
    const recorder = harness.createRecorder()
    const result = await recorder.start({ contextFolderPath: harness.tempDir })

    assert.equal(result.ok, true)
    assert.equal(harness.getCaptureCalls(), 1)
    assert.equal(harness.queueEnqueues.length, 0)
    assert.equal(fs.existsSync(path.join(harness.tempDir, 'familiar', 'stills', 'session-test', 'capture.webp')), false)

    await recorder.stop({ reason: 'test' })
  } finally {
    harness.cleanup()
  }
})
