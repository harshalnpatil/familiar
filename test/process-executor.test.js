const test = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const { PassThrough } = require('node:stream')

const { runCommand } = require('../src/utils/process-executor')

const createLogger = () => ({
  log: () => {},
  warn: () => {},
  error: () => {}
})

const createFakeChildProcess = ({ pid = 3210 } = {}) => {
  const child = new EventEmitter()
  child.pid = pid
  child.stdout = new PassThrough()
  child.stderr = new PassThrough()
  child.stdin = {
    end: () => {}
  }
  child.killCalls = []
  child.kill = (signal) => {
    child.killCalls.push(signal)
    setImmediate(() => {
      child.emit('close', null, signal)
    })
    return true
  }
  return child
}

test('runCommand kills the process group on timeout when supported', { skip: process.platform === 'win32' }, async () => {
  const child = createFakeChildProcess()
  const killCalls = []
  const originalProcessKill = process.kill

  process.kill = (pid, signal) => {
    killCalls.push({ pid, signal })
    setImmediate(() => {
      child.emit('close', null, signal)
    })
    return true
  }

  try {
    const result = await runCommand({
      command: '/usr/local/bin/claude',
      args: ['-p'],
      timeoutMs: 1,
      logger: createLogger(),
      spawnImpl: () => child
    })

    assert.equal(result.ok, false)
    assert.equal(result.timedOut, true)
    assert.deepEqual(killCalls, [{ pid: -child.pid, signal: 'SIGTERM' }])
    assert.deepEqual(child.killCalls, [])
  } finally {
    process.kill = originalProcessKill
  }
})
