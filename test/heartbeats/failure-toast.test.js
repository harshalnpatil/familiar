const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildHeartbeatFailureToastBody,
  getHeartbeatFailureToastActionLabel
} = require('../../src/heartbeats/failure-toast');

test('buildHeartbeatFailureToastBody includes the new wording and topic', () => {
  const result = buildHeartbeatFailureToastBody('daily_summary')
  assert.equal(result, 'heartbeat daily_summary failed. expand failures for details.')
});

test('buildHeartbeatFailureToastBody falls back to Heartbeat when topic missing', () => {
  const result = buildHeartbeatFailureToastBody('')
  assert.equal(result, 'heartbeat Heartbeat failed. expand failures for details.')
});

test('getHeartbeatFailureToastActionLabel returns the TextEdit action label', () => {
  assert.equal(getHeartbeatFailureToastActionLabel(), 'Expand Failures')
});
