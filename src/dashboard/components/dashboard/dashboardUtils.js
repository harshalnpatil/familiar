const TEMPLATE_TAG_REGEX = /\{\{([a-zA-Z0-9_]+)\}\}/g

export function formatTemplate(template, values = {}) {
  if (typeof template !== 'string') {
    return ''
  }
  return template.replace(TEMPLATE_TAG_REGEX, (_match, key) => {
    if (!Object.prototype.hasOwnProperty.call(values, key)) {
      return ''
    }
    const value = values[key]
    return value === null || value === undefined ? '' : String(value)
  })
}

export const ACTIVE_CAPTURE_STATES = new Set(['recording', 'idleGrace'])

export function resolveRecordingIndicatorVisuals({
  enabled,
  state,
  manualPaused,
  permissionGranted,
  permissionStatus,
  copy
}) {
  const isActiveState = ACTIVE_CAPTURE_STATES.has(state)
  const hasPermissionIssue = enabled && permissionGranted === false
  const permissionIssueByStatus = enabled && !hasPermissionIssue && typeof permissionStatus === 'string'
    ? !['granted', 'unavailable'].includes(permissionStatus)
    : false
  const resolvedOff = copy.off ?? copy.recordingIndicatorOff ?? 'Off'
  const resolvedPaused = copy.paused ?? copy.recordingIndicatorPaused ?? 'Paused'
  const resolvedPermissionNeeded = copy.permissionNeeded ?? copy.recordingIndicatorPermissionNeeded ?? 'Permission needed'
  const resolvedCapturing = copy.capturing ?? copy.recordingIndicatorCapturing ?? 'Capturing'
  const resolvedIdle = copy.idle ?? copy.recordingIndicatorIdle ?? 'Idle'
  let label = resolvedOff
  let dotClass = 'bg-zinc-400'
  if (!enabled) {
    label = resolvedOff
    dotClass = 'bg-zinc-400'
  } else if (manualPaused) {
    label = resolvedPaused
    dotClass = 'bg-amber-500'
  } else if (hasPermissionIssue || permissionIssueByStatus) {
    label = resolvedPermissionNeeded
    dotClass = 'bg-red-500'
  } else if (isActiveState) {
    label = resolvedCapturing
    dotClass = 'bg-emerald-500'
  } else {
    label = resolvedIdle
  }
  return {
    label,
    dotClass,
    status: enabled ? (manualPaused ? 'paused' : isActiveState ? 'recording' : 'idle') : 'off'
  }
}

export function formatBytes(bytes) {
  const value = Number.isFinite(bytes) ? Math.max(0, bytes) : 0
  if (value === 0) {
    return '0 B'
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  const scaled = value / (1024 ** exponent)
  const decimals = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2
  return `${scaled.toFixed(decimals)} ${units[exponent]}`
}

export function toArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((entry) => String(entry))
  }
  if (typeof value === 'string' && value.length > 0) {
    return [value]
  }
  return []
}

export function normalizeHarnessArray(value) {
  const result = []
  const source = toArray(value)
  for (const entry of source) {
    if (typeof entry === 'string' && entry.length > 0) {
      result.push(entry)
    }
  }
  return Array.from(new Set(result))
}

export function resolveAutoCleanupRetentionDays(value) {
  const next = Number.parseInt(value, 10)
  if (next === 7 || next === 2) {
    return next
  }
  return 2
}

export function toDisplayText(value) {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (value instanceof Error) {
    return value.message || 'Error'
  }
  if (typeof value === 'object' && typeof value.message === 'string') {
    return value.message
  }
  return String(value)
}

export function ensureDisplayText(value, fallback = '') {
  const next = toDisplayText(value)
  return next.length > 0 ? next : fallback
}
