function normalizeCapturePrivacyApp(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }

  const bundleId = typeof value.bundleId === 'string' && value.bundleId.trim()
    ? value.bundleId.trim()
    : null
  const name = typeof value.name === 'string' && value.name.trim()
    ? value.name.trim()
    : null
  const appPath = typeof value.appPath === 'string' && value.appPath.trim()
    ? value.appPath.trim()
    : null
  const iconPath = typeof value.iconPath === 'string' && value.iconPath.trim()
    ? value.iconPath.trim()
    : null

  if (!bundleId && !name) {
    return null
  }

  return {
    bundleId,
    name,
    appPath,
    iconPath
  }
}

function buildCapturePrivacyAppKey(value) {
  const normalized = normalizeCapturePrivacyApp(value)
  if (!normalized) {
    return ''
  }
  if (normalized.bundleId) {
    return `bundle:${normalized.bundleId}`
  }
  return `name:${normalized.name.toLowerCase()}`
}

function normalizeCapturePrivacyApps(value) {
  const source = Array.isArray(value) ? value : []
  const seen = new Set()
  const apps = []

  for (const entry of source) {
    const normalized = normalizeCapturePrivacyApp(entry)
    if (!normalized) {
      continue
    }

    const key = buildCapturePrivacyAppKey(normalized)
    if (!key || seen.has(key)) {
      continue
    }

    seen.add(key)
    apps.push(normalized)
  }

  return apps.sort((left, right) => {
    const leftLabel = (left.name || left.bundleId || '').toLowerCase()
    const rightLabel = (right.name || right.bundleId || '').toLowerCase()
    return leftLabel.localeCompare(rightLabel)
  })
}

export {
  buildCapturePrivacyAppKey,
  normalizeCapturePrivacyApp,
  normalizeCapturePrivacyApps
}
