const { normalizeAppString } = require('../utils/strings')

const normalizeBundleId = (value) => normalizeAppString(value, null)

const normalizeAppName = (value) => normalizeAppString(value, null)

const normalizeBlacklistedApp = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const bundleId = normalizeBundleId(value.bundleId)
  const name = normalizeAppName(value.name)
  if (!bundleId && !name) {
    return null
  }

  return {
    bundleId,
    name
  }
}

const buildBlacklistedAppKey = (value) => {
  const normalized = normalizeBlacklistedApp(value)
  if (!normalized) {
    return ''
  }
  if (normalized.bundleId) {
    return `bundle:${normalized.bundleId}`
  }
  return `name:${normalized.name.toLowerCase()}`
}

const normalizeBlacklistedApps = (value) => {
  const source = Array.isArray(value) ? value : []
  const seen = new Set()
  const normalized = []

  for (const entry of source) {
    const next = normalizeBlacklistedApp(entry)
    if (!next) {
      continue
    }
    const key = buildBlacklistedAppKey(next)
    if (!key || seen.has(key)) {
      continue
    }
    seen.add(key)
    normalized.push(next)
  }

  return normalized
}

const normalizeCapturePrivacySettings = (value = {}) => {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  return {
    blacklistedApps: normalizeBlacklistedApps(raw.blacklistedApps)
  }
}

const normalizeVisibleWindowApp = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const bundleId = normalizeBundleId(value.bundleId)
  const name = normalizeAppName(value.name)
  if (!bundleId && !name) {
    return null
  }

  return {
    bundleId,
    name
  }
}

const listVisibleApps = (value) => {
  const source = Array.isArray(value) ? value : []
  const seen = new Set()
  const apps = []

  for (const entry of source) {
    const next = normalizeVisibleWindowApp(entry)
    if (!next) {
      continue
    }

    const key = next.bundleId ? `bundle:${next.bundleId}` : `name:${next.name.toLowerCase()}`
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    apps.push(next)
  }

  return apps.sort((left, right) => {
    const leftName = (left.name || left.bundleId || '').toLowerCase()
    const rightName = (right.name || right.bundleId || '').toLowerCase()
    return leftName.localeCompare(rightName)
  })
}

const doesVisibleWindowMatchBlacklistedApp = ({ visibleWindow, blacklistedApp } = {}) => {
  const normalizedWindow = normalizeVisibleWindowApp(visibleWindow)
  const normalizedBlacklistedApp = normalizeBlacklistedApp(blacklistedApp)
  if (!normalizedWindow || !normalizedBlacklistedApp) {
    return false
  }

  if (normalizedBlacklistedApp.bundleId) {
    return normalizedBlacklistedApp.bundleId === normalizedWindow.bundleId
  }

  if (!normalizedBlacklistedApp.name || !normalizedWindow.name) {
    return false
  }

  return normalizedBlacklistedApp.name.toLowerCase() === normalizedWindow.name.toLowerCase()
}

const findMatchingBlacklistedApps = ({ visibleWindows, blacklistedApps } = {}) => {
  const normalizedVisibleWindows = Array.isArray(visibleWindows) ? visibleWindows : []
  const normalizedBlacklistedApps = normalizeBlacklistedApps(blacklistedApps)
  const matches = []

  for (const visibleWindow of normalizedVisibleWindows) {
    for (const blacklistedApp of normalizedBlacklistedApps) {
      if (!doesVisibleWindowMatchBlacklistedApp({ visibleWindow, blacklistedApp })) {
        continue
      }
      matches.push({
        visibleWindow: normalizeVisibleWindowApp(visibleWindow),
        blacklistedApp
      })
    }
  }

  return matches
}

const shouldSkipCaptureForBlacklistedApps = ({ visibleWindows, blacklistedApps } = {}) => {
  const matches = findMatchingBlacklistedApps({ visibleWindows, blacklistedApps })
  return {
    skip: matches.length > 0,
    matches
  }
}

module.exports = {
  normalizeBlacklistedApp,
  normalizeBlacklistedApps,
  normalizeCapturePrivacySettings,
  normalizeVisibleWindowApp,
  listVisibleApps,
  doesVisibleWindowMatchBlacklistedApp,
  findMatchingBlacklistedApps,
  shouldSkipCaptureForBlacklistedApps
}
