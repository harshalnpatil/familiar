const getElectronNativeImage = () => {
  const electron = require('electron')
  return electron && electron.nativeImage ? electron.nativeImage : null
}

const encodeSvgDataUrl = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

function createCircleIconFactory({
  nativeImage = getElectronNativeImage(),
  logger = console,
  size = 12,
  circleRadius = 4
} = {}) {
  const cache = new Map()
  const safeSize = Number.isFinite(size) && size > 0 ? Math.floor(size) : 12
  const safeCircleRadius = Number.isFinite(circleRadius) && circleRadius > 0
    ? circleRadius
    : Math.max(1, Math.floor(safeSize / 3))

  return ({ colorHex } = {}) => {
    if (!nativeImage || typeof nativeImage.createFromDataURL !== 'function') {
      return null
    }
    if (typeof colorHex !== 'string' || colorHex.length === 0) {
      return null
    }

    const cacheKey = `${safeSize}:${safeCircleRadius}:${colorHex}`
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }

    const center = safeSize / 2
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${safeSize}" height="${safeSize}"><circle cx="${center}" cy="${center}" r="${safeCircleRadius}" fill="${colorHex}"/></svg>`
    const icon = nativeImage.createFromDataURL(encodeSvgDataUrl(svg))
    if (!icon || (typeof icon.isEmpty === 'function' && icon.isEmpty())) {
      logger.warn('Tray circle icon creation failed', {
        colorHex,
        size: safeSize,
        circleRadius: safeCircleRadius
      })
      return null
    }

    const sizedIcon = typeof icon.resize === 'function'
      ? icon.resize({ width: safeSize, height: safeSize })
      : icon
    if (typeof sizedIcon.setTemplateImage === 'function') {
      sizedIcon.setTemplateImage(false)
    }
    cache.set(cacheKey, sizedIcon)
    return sizedIcon
  }
}

module.exports = {
  createCircleIconFactory
}
