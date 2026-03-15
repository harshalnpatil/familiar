const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const {
  normalizeInstalledApps,
  readInstalledAppsOverride,
  getInstalledAppIconDataUrl,
  readIconPathDataUrl,
  resolveDeclaredIconPath
} = require('../src/apps/installed-apps')

test('normalizeInstalledApps preserves app paths, deduplicates by bundle id, and falls back to name', () => {
  const apps = normalizeInstalledApps([
    { bundleId: 'com.apple.MobileSMS', name: 'Messages', appPath: '/Applications/Messages.app' },
    { bundleId: 'com.apple.MobileSMS', name: 'Messages Duplicate', appPath: '/Applications/Messages Copy.app' },
    { name: ' Slack ', appPath: '/Applications/Slack.app', iconPath: '/Applications/Slack.app/Contents/Resources/AppIcon.icns' },
    { name: 'slack' }
  ])

  assert.deepEqual(apps, [
    {
      bundleId: 'com.apple.MobileSMS',
      name: 'Messages',
      appPath: '/Applications/Messages.app',
      iconPath: null
    },
    {
      bundleId: null,
      name: 'Slack',
      appPath: '/Applications/Slack.app',
      iconPath: '/Applications/Slack.app/Contents/Resources/AppIcon.icns'
    }
  ])
})

test('readInstalledAppsOverride returns normalized apps from E2E env', () => {
  const original = process.env.FAMILIAR_E2E_INSTALLED_APPS_JSON
  process.env.FAMILIAR_E2E_INSTALLED_APPS_JSON = JSON.stringify([
    { bundleId: 'com.google.Chrome', name: 'Google Chrome', appPath: '/Applications/Google Chrome.app' },
    { bundleId: 'com.google.Chrome', name: 'Google Chrome Duplicate' }
  ])

  try {
    const apps = readInstalledAppsOverride({ logger: { warn: () => {} } })
    assert.deepEqual(apps, [
      {
        bundleId: 'com.google.Chrome',
        name: 'Google Chrome',
        appPath: '/Applications/Google Chrome.app',
        iconPath: null
      }
    ])
  } finally {
    if (original === undefined) {
      delete process.env.FAMILIAR_E2E_INSTALLED_APPS_JSON
    } else {
      process.env.FAMILIAR_E2E_INSTALLED_APPS_JSON = original
    }
  }
})

test('getInstalledAppIconDataUrl returns null for missing paths and ignores empty icons', async () => {
  assert.equal(
    await getInstalledAppIconDataUrl({
      appPath: '',
      getFileIcon: async () => {
        throw new Error('should not load')
      }
    }),
    null
  )

  const emptyIcon = await getInstalledAppIconDataUrl({
    appPath: '/Applications/Test.app',
    getFileIcon: async () => ({
      isEmpty: () => true,
      toDataURL: () => 'data:image/png;base64,AAAA'
    }),
    logger: { warn: () => {} }
  })
  assert.equal(emptyIcon, null)
})

test('readIconPathDataUrl converts a png file into a data url', async () => {
  const iconPath = path.join(os.tmpdir(), `familiar-installed-icon-${Date.now()}.png`)
  fs.writeFileSync(
    iconPath,
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO0pX1sAAAAASUVORK5CYII=',
      'base64'
    )
  )

  const dataUrl = await readIconPathDataUrl({
    iconPath,
    logger: { warn: () => {} }
  })

  assert.match(dataUrl, /^data:image\/png;base64,/)
})

test('getInstalledAppIconDataUrl prefers the resolved icon path data url', async () => {
  const iconPath = path.join(os.tmpdir(), `familiar-installed-icon-${Date.now()}-resolved.png`)
  fs.writeFileSync(
    iconPath,
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO0pX1sAAAAASUVORK5CYII=',
      'base64'
    )
  )

  const iconDataUrl = await getInstalledAppIconDataUrl({
    appPath: '/Applications/Test.app',
    iconPath,
    getFileIcon: async () => {
      throw new Error('should not use file icon fallback')
    },
    logger: { warn: () => {} }
  })

  assert.match(iconDataUrl, /^data:image\/png;base64,/)
})

test('resolveDeclaredIconPath finds icon resources declared in Info.plist', async () => {
  const appRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'familiar-installed-icon-'))
  const resourcesDir = path.join(appRoot, 'Contents', 'Resources')
  fs.mkdirSync(resourcesDir, { recursive: true })
  const expectedIconPath = path.join(resourcesDir, 'AppIcon.icns')
  fs.writeFileSync(expectedIconPath, 'icon')

  const iconPath = await resolveDeclaredIconPath({
    appPath: appRoot,
    infoPlist: {
      CFBundleIconFile: 'AppIcon'
    }
  })

  assert.equal(iconPath, expectedIconPath)
})
