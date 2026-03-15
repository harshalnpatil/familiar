import { useCallback, useEffect, useRef, useState } from 'react'

import {
  buildCapturePrivacyAppKey,
  normalizeCapturePrivacyApp,
  normalizeCapturePrivacyApps
} from './capturePrivacyAppUtils'

export const useDashboardCapturePrivacy = ({
  familiar,
  mc,
  activeSection,
  settings,
  setSettings,
  saveSettings
}) => {
  const [installedApps, setInstalledApps] = useState([])
  const [installedAppsLoading, setInstalledAppsLoading] = useState(false)
  const [installedAppsError, setInstalledAppsError] = useState('')
  const [appSearchQuery, setAppSearchQuery] = useState('')
  const [capturePrivacyMessage, setCapturePrivacyMessage] = useState('')
  const [capturePrivacyError, setCapturePrivacyError] = useState('')
  const [installedAppIcons, setInstalledAppIcons] = useState({})
  const hasLoadedInstalledAppsRef = useRef(false)
  const installedAppIconsRef = useRef({})
  const installedAppIconRequestsRef = useRef(new Set())

  const refreshInstalledApps = useCallback(async () => {
    if (!familiar || typeof familiar.listInstalledApps !== 'function') {
      setInstalledApps([])
      setInstalledAppsError(mc.dashboard.settings.errors.bridgeUnavailableRestart)
      return
    }

    setInstalledAppsLoading(true)
    setInstalledAppsError('')
    installedAppIconRequestsRef.current.clear()
    installedAppIconsRef.current = {}
    setInstalledAppIcons({})
    try {
      const result = await familiar.listInstalledApps()
      if (result?.ok) {
        setInstalledApps(normalizeCapturePrivacyApps(result.apps))
        return
      }
      setInstalledApps([])
      setInstalledAppsError(result?.message || mc.dashboard.recording.installedAppsLoadFailed)
    } catch (error) {
      console.error('Failed to list installed apps', error)
      setInstalledApps([])
      setInstalledAppsError(mc.dashboard.recording.installedAppsLoadFailed)
    } finally {
      setInstalledAppsLoading(false)
    }
  }, [
    familiar,
    mc.dashboard.recording.installedAppsLoadFailed,
    mc.dashboard.settings.errors.bridgeUnavailableRestart
  ])

  const setBlacklistedAppEnabled = useCallback(async (app, enabled) => {
    const normalizedApp = normalizeCapturePrivacyApp(app)
    if (!normalizedApp) {
      return false
    }
    if (!familiar || typeof familiar.saveSettings !== 'function') {
      setCapturePrivacyError(mc.dashboard.settings.errors.bridgeUnavailableRestart)
      return false
    }

    const currentApps = normalizeCapturePrivacyApps(settings?.capturePrivacy?.blacklistedApps)
    const appKey = buildCapturePrivacyAppKey(normalizedApp)
    const nextApps = enabled
      ? normalizeCapturePrivacyApps([...currentApps, {
          bundleId: normalizedApp.bundleId,
          name: normalizedApp.name
        }])
      : currentApps.filter((entry) => buildCapturePrivacyAppKey(entry) !== appKey)

    setCapturePrivacyError('')
    setCapturePrivacyMessage(mc.dashboard.settings.statusSaving)
    try {
      const result = await saveSettings({
        capturePrivacy: {
          blacklistedApps: nextApps
        }
      })
      if (!result) {
        setCapturePrivacyMessage('')
        setCapturePrivacyError(mc.dashboard.settings.errors.failedToSaveSetting)
        return false
      }

      setSettings((previous) => ({
        ...previous,
        capturePrivacy: {
          blacklistedApps: nextApps
        }
      }))
      setCapturePrivacyMessage(mc.dashboard.settings.statusSaved)
      return true
    } catch (error) {
      console.error('Failed to save blacklisted apps', error)
      setCapturePrivacyMessage('')
      setCapturePrivacyError(mc.dashboard.settings.errors.failedToSaveSetting)
      return false
    }
  }, [
    familiar,
    mc.dashboard.settings.errors.bridgeUnavailableRestart,
    mc.dashboard.settings.errors.failedToSaveSetting,
    mc.dashboard.settings.statusSaved,
    mc.dashboard.settings.statusSaving,
    saveSettings,
    setSettings,
    settings?.capturePrivacy?.blacklistedApps
  ])

  const requestInstalledAppIcon = useCallback(async (app) => {
    const normalizedApp = normalizeCapturePrivacyApp(app)
    const appKey = buildCapturePrivacyAppKey(normalizedApp)
    const currentIconState = installedAppIconsRef.current[appKey]
    if (!appKey || !normalizedApp?.appPath) {
      return null
    }
    if (!familiar || typeof familiar.getInstalledAppIcon !== 'function') {
      return null
    }
    if (currentIconState && currentIconState.status !== 'loading') {
      return currentIconState.iconDataUrl || null
    }
    if (installedAppIconRequestsRef.current.has(appKey)) {
      return null
    }

    installedAppIconRequestsRef.current.add(appKey)
    setInstalledAppIcons((previous) => {
      if (previous[appKey]) {
        installedAppIconsRef.current = previous
        return previous
      }
      const next = {
        ...previous,
        [appKey]: {
          status: 'loading',
          iconDataUrl: null
        }
      }
      installedAppIconsRef.current = next
      return next
    })

    try {
      const result = await familiar.getInstalledAppIcon({
        appPath: normalizedApp.appPath,
        iconPath: normalizedApp.iconPath
      })
      const iconDataUrl = result?.ok ? result.iconDataUrl || null : null
      setInstalledAppIcons((previous) => {
        const next = {
          ...previous,
          [appKey]: {
            status: iconDataUrl ? 'loaded' : 'empty',
            iconDataUrl
          }
        }
        installedAppIconsRef.current = next
        return next
      })
      return iconDataUrl
    } catch (error) {
      console.warn('Failed to load installed app icon', {
        bundleId: normalizedApp.bundleId,
        name: normalizedApp.name,
        message: error?.message || String(error)
      })
      setInstalledAppIcons((previous) => {
        const next = {
          ...previous,
          [appKey]: {
            status: 'error',
            iconDataUrl: null
          }
        }
        installedAppIconsRef.current = next
        return next
      })
      return null
    } finally {
      installedAppIconRequestsRef.current.delete(appKey)
    }
  }, [familiar])

  useEffect(() => {
    if (activeSection !== 'recording' || hasLoadedInstalledAppsRef.current) {
      return
    }
    hasLoadedInstalledAppsRef.current = true
    void refreshInstalledApps()
  }, [activeSection, refreshInstalledApps])

  const filteredInstalledApps = installedApps.filter((entry) => {
    if (!appSearchQuery.trim()) {
      return true
    }
    const query = appSearchQuery.trim().toLowerCase()
    return (
      (entry.name || '').toLowerCase().includes(query) ||
      (entry.bundleId || '').toLowerCase().includes(query)
    )
  })

  return {
    installedApps,
    filteredInstalledApps,
    installedAppsLoading,
    installedAppsError,
    appSearchQuery,
    setAppSearchQuery,
    installedAppIcons,
    capturePrivacyMessage,
    capturePrivacyError,
    refreshInstalledApps,
    setBlacklistedAppEnabled,
    requestInstalledAppIcon
  }
}
