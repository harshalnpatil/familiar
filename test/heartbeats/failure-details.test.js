const test = require('node:test')
const assert = require('node:assert/strict')

const {
  OPEN_HEARTBEAT_FAILURE_DETAILS_ACTION,
  openHeartbeatFailureDetails
} = require('../../src/heartbeats/failure-details')

test('openHeartbeatFailureDetails opens the failure text in TextEdit', async () => {
  const logCalls = []

  const result = await openHeartbeatFailureDetails({
    data: { message: 'Heartbeat failed: missing API key' },
    logger: {
      log: (...args) => logCalls.push(args),
      error: () => {}
    },
    openTextInTextEditFn: async ({ text }) => ({
      ok: true,
      targetPath: `/tmp/${text.length}.txt`
    })
  })

  assert.equal(OPEN_HEARTBEAT_FAILURE_DETAILS_ACTION, 'open-heartbeat-failure-details')
  assert.deepEqual(result, {
    ok: true,
    mode: 'textedit',
    targetPath: '/tmp/33.txt'
  })
  assert.equal(logCalls.length, 1)
  assert.equal(logCalls[0][0], 'Opened heartbeat failure details in TextEdit')
})

test('openHeartbeatFailureDetails records an E2E event instead of opening TextEdit', async () => {
  const events = []

  const result = await openHeartbeatFailureDetails({
    data: { message: 'Heartbeat failed: command exited 1' },
    isE2E: true,
    e2eTextEditOpenEvents: events,
    logger: {
      log: () => {},
      error: () => {}
    },
    nowFn: () => 1234,
    openTextInTextEditFn: async () => {
      throw new Error('should not be called')
    }
  })

  assert.deepEqual(result, {
    ok: true,
    mode: 'e2e',
    text: 'Heartbeat failed: command exited 1'
  })
  assert.deepEqual(events, [{
    kind: 'heartbeat-failure-details',
    text: 'Heartbeat failed: command exited 1',
    at: 1234
  }])
})

test('openHeartbeatFailureDetails returns an error when the failure message is missing', async () => {
  const errorCalls = []

  const result = await openHeartbeatFailureDetails({
    data: { message: '   ' },
    logger: {
      log: () => {},
      error: (...args) => errorCalls.push(args)
    }
  })

  assert.deepEqual(result, {
    ok: false,
    message: 'Heartbeat failure message is required.'
  })
  assert.equal(errorCalls.length, 1)
  assert.equal(errorCalls[0][0], 'Heartbeat failure details open skipped: missing message')
})
