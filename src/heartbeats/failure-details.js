const { openTextInTextEdit } = require('../utils/open-text-in-textedit')

const OPEN_HEARTBEAT_FAILURE_DETAILS_ACTION = 'open-heartbeat-failure-details'

const resolveFailureMessage = (data) => {
  if (typeof data === 'string') {
    return data
  }
  if (!data || typeof data !== 'object') {
    return ''
  }
  return typeof data.message === 'string' ? data.message : ''
}

const openHeartbeatFailureDetails = async ({
  data,
  isE2E = false,
  e2eTextEditOpenEvents = [],
  logger = console,
  openTextInTextEditFn = openTextInTextEdit,
  nowFn = Date.now
} = {}) => {
  const message = resolveFailureMessage(data)
  if (message.trim().length === 0) {
    logger.error('Heartbeat failure details open skipped: missing message')
    return { ok: false, message: 'Heartbeat failure message is required.' }
  }

  if (isE2E) {
    if (Array.isArray(e2eTextEditOpenEvents)) {
      e2eTextEditOpenEvents.push({
        kind: 'heartbeat-failure-details',
        text: message,
        at: nowFn()
      })
    }

    logger.log('Captured heartbeat failure details open for E2E', {
      textLength: message.length
    })

    return {
      ok: true,
      mode: 'e2e',
      text: message
    }
  }

  try {
    const result = await openTextInTextEditFn({ text: message })

    logger.log('Opened heartbeat failure details in TextEdit', {
      targetPath: result.targetPath,
      textLength: message.length
    })

    return {
      ok: true,
      mode: 'textedit',
      targetPath: result.targetPath
    }
  } catch (error) {
    logger.error('Failed to open heartbeat failure details in TextEdit', {
      error: error?.message || String(error),
      textLength: message.length
    })

    return {
      ok: false,
      message: error?.message || 'Failed to open heartbeat failure details.'
    }
  }
}

module.exports = {
  OPEN_HEARTBEAT_FAILURE_DETAILS_ACTION,
  openHeartbeatFailureDetails
}
