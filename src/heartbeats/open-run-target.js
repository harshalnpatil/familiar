const { openFileInTextEdit } = require('../utils/open-in-textedit')
const { openHeartbeatFailureDetails } = require('./failure-details')

const toSafeString = (value) => (typeof value === 'string' ? value.trim() : '')

const openHeartbeatRunTarget = async ({
  entry = {},
  isE2E = false,
  e2eTextEditOpenEvents = [],
  logger = console,
  openFileInTextEditFn = openFileInTextEdit,
  openHeartbeatFailureDetailsFn = openHeartbeatFailureDetails
} = {}) => {
  const status = toSafeString(entry.status).toLowerCase()
  const heartbeatId = toSafeString(entry.heartbeatId)

  if (status === 'failed') {
    const result = await openHeartbeatFailureDetailsFn({
      data: { message: toSafeString(entry.errorMessage) },
      isE2E,
      e2eTextEditOpenEvents,
      logger
    })

    if (result.ok) {
      logger.log('Opened heartbeat tray failure details', {
        heartbeatId,
        textLength: toSafeString(entry.errorMessage).length
      })
    }

    return {
      ...result,
      heartbeatId,
      status
    }
  }

  const targetPath = toSafeString(entry.outputPath)
  if (!targetPath) {
    logger.error('Heartbeat tray open skipped: missing target path', {
      heartbeatId,
      status
    })
    return {
      ok: false,
      heartbeatId,
      status,
      message: 'Heartbeat target path is required.'
    }
  }

  if (isE2E) {
    if (Array.isArray(e2eTextEditOpenEvents)) {
      e2eTextEditOpenEvents.push({
        heartbeatId,
        status,
        targetPath,
        at: Date.now()
      })
    }

    logger.log('Captured TextEdit open for E2E', {
      heartbeatId,
      status,
      targetPath
    })

    return {
      ok: true,
      mode: 'e2e',
      heartbeatId,
      status,
      targetPath
    }
  }

  await openFileInTextEditFn({ targetPath })

  logger.log('Opened heartbeat tray target', {
    heartbeatId,
    status,
    targetPath
  })

  return {
    ok: true,
    mode: 'textedit',
    heartbeatId,
    status,
    targetPath
  }
}

module.exports = {
  openHeartbeatRunTarget
}
