const { spawn } = require('node:child_process')

const { DEFAULT_TIMEOUT_MS } = require('../harness-adapters/types')

const FORCE_KILL_GRACE_MS = 10 * 60 * 1000

const normalizeTimeoutMs = (timeoutMs) => {
  const numericTimeout = Number(timeoutMs)
  if (!Number.isFinite(numericTimeout) || numericTimeout <= 0) {
    return DEFAULT_TIMEOUT_MS
  }
  return Math.floor(numericTimeout)
}

const runCommand = async ({
  command,
  args = [],
  cwd = undefined,
  input = '',
  timeoutMs = DEFAULT_TIMEOUT_MS,
  logger = console,
  spawnImpl = spawn
} = {}) => {
  const normalizedArgs = Array.isArray(args) ? args : []
  const normalizedTimeoutMs = normalizeTimeoutMs(timeoutMs)

  const killChild = ({ child, signal, logger, command, cwd, args }) => {
    if (!child) {
      return
    }

    if (Number.isInteger(child.pid) && child.pid > 0) {
      try {
        process.kill(-child.pid, signal)
        return
      } catch (error) {
        logger.warn('Harness adapter process group kill failed', {
          command,
          args,
          cwd: cwd || null,
          pid: child.pid,
          signal,
          message: error?.message || String(error)
        })
      }
    }

    try {
      child.kill(signal)
    } catch (error) {
      logger.warn('Harness adapter child kill failed', {
        command,
        args,
        cwd: cwd || null,
        pid: child.pid || null,
        signal,
        message: error?.message || String(error)
      })
    }
  }

  return await new Promise((resolve) => {
    let settled = false
    let timedOut = false
    let stdout = ''
    let stderr = ''
    let timeoutId = null
    let forceKillId = null
    const startedAt = Date.now()

    const settle = (payload) => {
      if (settled) {
        return
      }
      settled = true
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      if (forceKillId) {
        clearTimeout(forceKillId)
      }
      resolve({
        ...payload,
        timedOut,
        durationMs: Date.now() - startedAt
      })
    }

    let child = null
    try {
      child = spawnImpl(command, normalizedArgs, {
        cwd,
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: true
      })
    } catch (error) {
      settle({
        ok: false,
        code: null,
        signal: null,
        stdout,
        stderr,
        error
      })
      return
    }

    timeoutId = setTimeout(() => {
      timedOut = true
      logger.warn('Harness adapter command timed out', {
        command,
        args: normalizedArgs,
        cwd: cwd || null,
        timeoutMs: normalizedTimeoutMs
      })
      killChild({
        child,
        signal: 'SIGTERM',
        logger,
        command,
        cwd,
        args: normalizedArgs
      })
      forceKillId = setTimeout(() => {
        killChild({
          child,
          signal: 'SIGKILL',
          logger,
          command,
          cwd,
          args: normalizedArgs
        })
      }, FORCE_KILL_GRACE_MS)
    }, normalizedTimeoutMs)

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString()
    })

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString()
    })

    child.on('error', (error) => {
      settle({
        ok: false,
        code: null,
        signal: null,
        stdout,
        stderr,
        error
      })
    })

    child.on('close', (code, signal) => {
      settle({
        ok: code === 0 && !timedOut,
        code,
        signal,
        stdout,
        stderr,
        error: null
      })
    })

    if (typeof input === 'string' && input.length > 0) {
      child.stdin.end(input)
      return
    }

    child.stdin.end()
  })
}

module.exports = {
  FORCE_KILL_GRACE_MS,
  runCommand
}
