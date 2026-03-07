const toSafeHeartbeats = (payload = {}) => {
  const items = payload?.heartbeats?.items
  return Array.isArray(items) ? items : []
}

const mergeHeartbeatsIntoSettings = (previousSettings = {}, payload = {}) => ({
  ...previousSettings,
  heartbeats: {
    ...(previousSettings?.heartbeats || {}),
    items: toSafeHeartbeats(payload)
  }
})

const shouldRefreshHeartbeatsOnSectionOpen = ({
  previousSection = '',
  activeSection = ''
} = {}) => activeSection === 'heartbeats' && previousSection !== 'heartbeats'

module.exports = {
  mergeHeartbeatsIntoSettings,
  shouldRefreshHeartbeatsOnSectionOpen,
  toSafeHeartbeats
}
