import { useCallback, useEffect } from 'react'

export const useDashboardUpdates = (state) => {
  const {
    familiar,
    mc,
    displayFormatters,
    updatesState,
    setUpdatesState,
    setUpdateMessage,
    setUpdateError,
    isCheckingForUpdates,
    setIsCheckingForUpdates
  } = state

  const checkForUpdates = useCallback(async () => {
    if (!familiar || typeof familiar.checkForUpdates !== 'function') {
      setUpdateError(mc.dashboard.updates.errors.bridgeUnavailableRestart)
      return
    }
    if (isCheckingForUpdates) {
      setUpdateMessage(mc.dashboard.updates.statusAlreadyCheckingForUpdates)
      return
    }
    setUpdateMessage(mc.dashboard.updates.statusCheckingForUpdates)
    setUpdateError('')
    setIsCheckingForUpdates(true)
    try {
      const result = await familiar.checkForUpdates({ reason: 'manual' })
      if (result && result.ok) {
        const version = result.updateInfo?.version || ''
        const currentVersion = result.currentVersion || ''
        let nextStatus = mc.dashboard.updates.statusNoUpdatesFound
        if (version && currentVersion) {
          const currentParts = String(currentVersion)
            .replace(/^v/i, '')
            .split(/[-+]/)[0]
            .split('.')
            .map((part) => Number.parseInt(part, 10))
            .filter(Number.isFinite)
          const nextParts = String(version)
            .replace(/^v/i, '')
            .split(/[-+]/)[0]
            .split('.')
            .map((part) => Number.parseInt(part, 10))
            .filter(Number.isFinite)
          const maxLength = Math.max(currentParts.length, nextParts.length)
          let comparison = 0
          for (let i = 0; i < maxLength; i += 1) {
            const currentPart = currentParts[i] || 0
            const nextPart = nextParts[i] || 0
            if (currentPart < nextPart) {
              comparison = -1
              break
            }
            if (currentPart > nextPart) {
              comparison = 1
              break
            }
          }
          if (comparison === -1) {
            nextStatus = displayFormatters.updateAvailable({ currentVersion, version })
          } else if (comparison !== 1) {
            nextStatus = mc.dashboard.updates.statusNoUpdatesFound
          }
        }
        setUpdateMessage(nextStatus)
        setUpdatesState((previous) => ({
          percent: previous.percent,
          visible: previous.visible && previous.percent > 0,
          label: previous.label
        }))
        if (nextStatus === mc.dashboard.updates.statusNoUpdatesFound) {
          setUpdatesState((previous) =>
            previous.percent === 0
              ? {
                percent: 0,
                visible: false,
                label: ''
              }
              : previous
          )
        }
        return
      }
      if (result && result.reason === 'checking') {
        setUpdateMessage(mc.dashboard.updates.statusAlreadyCheckingForUpdates)
        return
      }
      if (result && result.reason === 'disabled') {
        setUpdateMessage('')
        setUpdatesState({ percent: 0, visible: false, label: '' })
        setUpdateError(mc.dashboard.updates.errors.autoUpdatesDisabled)
        return
      }
      setUpdateMessage('')
      setUpdateError(result?.message || mc.dashboard.updates.errors.failedToCheckForUpdates)
    } catch (error) {
      console.error('Failed to check for updates', error)
      setUpdateMessage('')
      setUpdateError(mc.dashboard.updates.errors.failedToCheckForUpdates)
    } finally {
      setIsCheckingForUpdates(false)
    }
  }, [
    familiar,
    displayFormatters,
    isCheckingForUpdates,
    mc.dashboard.updates.errors.bridgeUnavailableRestart,
    mc.dashboard.updates.errors.autoUpdatesDisabled,
    mc.dashboard.updates.errors.failedToCheckForUpdates,
    mc.dashboard.updates.statusAlreadyCheckingForUpdates,
    mc.dashboard.updates.statusCheckingForUpdates,
    mc.dashboard.updates.statusNoUpdatesFound,
    setUpdateError,
    setUpdateMessage,
    setUpdatesState,
    setIsCheckingForUpdates
  ])

  useEffect(() => {
    if (!familiar || typeof familiar.onUpdateDownloadProgress !== 'function') {
      return () => {}
    }
    const unsubscribeProgress = familiar.onUpdateDownloadProgress((payload) => {
      const percent = payload && Number.isFinite(payload.percent) ? payload.percent : null
      if (!Number.isFinite(percent)) {
        return
      }
      const clamped = Math.max(0, Math.min(100, percent))
      const rounded = Math.round(clamped)
      setUpdatesState({
        percent: rounded,
        visible: true,
        label: displayFormatters.updateDownloading(rounded)
      })
    })
    const unsubscribeDownloaded = familiar.onUpdateDownloaded((payload) => {
      const version = payload && typeof payload.version === 'string' ? payload.version : ''
      setUpdatesState({
        percent: 100,
        visible: true,
        label: displayFormatters.updateDownloadComplete({ version })
      })
    })
    return () => {
      if (typeof unsubscribeProgress === 'function') {
        unsubscribeProgress()
      }
      if (typeof unsubscribeDownloaded === 'function') {
        unsubscribeDownloaded()
      }
    }
  }, [displayFormatters, familiar, setUpdatesState])

  return {
    checkForUpdates
  }
}
