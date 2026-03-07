const test = require('node:test')
const assert = require('node:assert/strict')

const { openHeartbeatRunTarget } = require('../../src/heartbeats/open-run-target')

test('openHeartbeatRunTarget opens completed heartbeat output in TextEdit', async () => {
  const openCalls = []
  const logCalls = []

  const result = await openHeartbeatRunTarget({
    entry: {
      heartbeatId: 'hb-1',
      status: 'completed',
      outputPath: '/tmp/heartbeat.md'
    },
    logger: {
      log: (...args) => logCalls.push(args),
      error: () => {}
    },
    openFileInTextEditFn: async ({ targetPath }) => {
      openCalls.push(targetPath)
    }
  })

  assert.deepEqual(openCalls, ['/tmp/heartbeat.md'])
  assert.deepEqual(result, {
    ok: true,
    mode: 'textedit',
    heartbeatId: 'hb-1',
    status: 'completed',
    targetPath: '/tmp/heartbeat.md'
  })
  assert.equal(logCalls[0][0], 'Opened heartbeat tray target')
})

test('openHeartbeatRunTarget opens failed heartbeat details in TextEdit', async () => {
  const detailCalls = []
  const logCalls = []
  const logger = {
    log: (...args) => logCalls.push(args),
    error: () => {}
  }

  const result = await openHeartbeatRunTarget({
    entry: {
      heartbeatId: 'hb-2',
      status: 'failed',
      errorMessage: 'Runner unavailable'
    },
    logger,
    openHeartbeatFailureDetailsFn: async (payload) => {
      detailCalls.push(payload)
      return {
        ok: true,
        mode: 'textedit',
        targetPath: '/tmp/failure.txt'
      }
    }
  })

  assert.equal(detailCalls.length, 1)
  assert.deepEqual(detailCalls[0].data, { message: 'Runner unavailable' })
  assert.equal(detailCalls[0].isE2E, false)
  assert.deepEqual(detailCalls[0].e2eTextEditOpenEvents, [])
  assert.equal(detailCalls[0].logger, logger)
  assert.deepEqual(result, {
    ok: true,
    mode: 'textedit',
    targetPath: '/tmp/failure.txt',
    heartbeatId: 'hb-2',
    status: 'failed'
  })
  assert.equal(logCalls.at(-1)[0], 'Opened heartbeat tray failure details')
})

test('openHeartbeatRunTarget records failed heartbeat details in E2E mode', async () => {
  const events = []

  const result = await openHeartbeatRunTarget({
    entry: {
      heartbeatId: 'hb-3',
      status: 'failed',
      errorMessage: 'Timed out'
    },
    isE2E: true,
    e2eTextEditOpenEvents: events,
    logger: {
      log: () => {},
      error: () => {}
    },
    openHeartbeatFailureDetailsFn: async ({ data, isE2E }) => ({
      ok: true,
      mode: isE2E ? 'e2e' : 'textedit',
      text: data.message
    })
  })

  assert.deepEqual(result, {
    ok: true,
    mode: 'e2e',
    text: 'Timed out',
    heartbeatId: 'hb-3',
    status: 'failed'
  })
  assert.deepEqual(events, [])
})

test('openHeartbeatRunTarget returns an error when completed heartbeat output path is missing', async () => {
  const errorCalls = []

  const result = await openHeartbeatRunTarget({
    entry: {
      heartbeatId: 'hb-4',
      status: 'completed'
    },
    logger: {
      log: () => {},
      error: (...args) => errorCalls.push(args)
    }
  })

  assert.deepEqual(result, {
    ok: false,
    heartbeatId: 'hb-4',
    status: 'completed',
    message: 'Heartbeat target path is required.'
  })
  assert.equal(errorCalls[0][0], 'Heartbeat tray open skipped: missing target path')
})
