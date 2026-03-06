import { useEffect, useState } from 'react'

import { toDisplayText } from './dashboardUtils'
import dashboardCapturePermissionRules from './dashboardCapturePermissionRules.cjs'

const {
  resolvePermissionCheckState,
  resolvePermissionStateFromFamiliar,
  resolvePermissionStateFromResult
} = dashboardCapturePermissionRules

const isPermissionGrantedFromStatus = (permissionStatus, permissionGranted) => {
  if (permissionStatus === 'granted' || permissionStatus === 'authorized' || permissionStatus === 'allowed') {
    return true
  }
  if (permissionStatus === 'unavailable') {
    return true
  }

  return permissionGranted === true
}

export const useDashboardCapture = (state) => {
  const {
    familiar,
    recordingStatus,
    setStatusBusySafe,
    setRecordingStatus,
    setRecordingError,
    setRecordingMessage,
    refreshRecordingStatus
  } = state

  const [permissionCheckState, setPermissionCheckState] = useState('idle')
  const systemPermissionGranted = isPermissionGrantedFromStatus(
    recordingStatus.permissionStatus,
    recordingStatus.permissionGranted
  )

  useEffect(() => {
    if (permissionCheckState === 'idle' || permissionCheckState === 'checking') {
      return
    }
    setPermissionCheckState(systemPermissionGranted ? 'granted' : 'denied')
  }, [systemPermissionGranted, permissionCheckState])

  const refreshRecordingStatusSafe = (typeof refreshRecordingStatus === 'function'
    ? refreshRecordingStatus
    : null)

  const checkPermissions = async () => {
    if (!familiar) {
      return { permissionCheckState, permissionGranted: false, permissionStatus: 'unknown' }
    }
    if (permissionCheckState === 'checking') {
      return { permissionCheckState: 'checking', permissionGranted: systemPermissionGranted, permissionStatus: recordingStatus.permissionStatus }
    }

    setPermissionCheckState('checking')
    setStatusBusySafe(true)
    try {
      const result = await resolvePermissionStateFromFamiliar(familiar)
      const nextPermissionCheckState = resolvePermissionCheckState(result)

      setPermissionCheckState(nextPermissionCheckState)
      const nextPermissionState = resolvePermissionStateFromResult(result)
      if (nextPermissionState) {
        const permissionStatus = toDisplayText(nextPermissionState.permissionStatus)
        setRecordingStatus((previous) => ({
          ...previous,
          permissionStatus: permissionStatus || 'unknown',
          permissionGranted: nextPermissionState.permissionGranted
        }))
        return {
          permissionCheckState: nextPermissionCheckState,
          permissionGranted: nextPermissionState.permissionGranted,
          permissionStatus: permissionStatus || 'unknown'
        }
      }
      return {
        permissionCheckState: nextPermissionCheckState,
        permissionGranted: false,
        permissionStatus: 'unknown'
      }
    } catch (error) {
      console.error('Failed to check permissions', error)
      setRecordingError('Failed to check screen recording permission.')
      setRecordingStatus((previous) => ({ ...previous, permissionGranted: false, permissionStatus: 'denied' }))
      setPermissionCheckState('denied')
      return { permissionCheckState: 'denied', permissionGranted: false, permissionStatus: 'denied' }
    } finally {
      if (refreshRecordingStatusSafe) {
        await refreshRecordingStatusSafe()
      }
      setPermissionCheckState((next) => (next === 'checking' ? 'denied' : next))
      setStatusBusySafe(false)
    }
  }

  const toggleCapture = async () => {
    if (!familiar) {
      return
    }
    const isActive = recordingStatus.enabled && !recordingStatus.manualPaused
    const handler = isActive ? familiar.pauseScreenStills : familiar.startScreenStills
    if (typeof handler !== 'function') {
      setRecordingError('Capture bridge unavailable. Restart the app.')
      return
    }

    setStatusBusySafe(true)
    try {
      const result = await handler()
      if (result && result.ok === false) {
        setRecordingError(result.message || 'Failed to update capture state.')
      } else {
        setRecordingMessage('')
        if (refreshRecordingStatusSafe) {
          await refreshRecordingStatusSafe()
        }
      }
    } catch (error) {
      console.error('Failed to toggle capture', error)
      setRecordingError('Failed to update capture state.')
    } finally {
      setStatusBusySafe(false)
    }
  }

  const openScreenRecordingSettings = async () => {
    if (!familiar || typeof familiar.openScreenRecordingSettings !== 'function') {
      return
    }
    try {
      const result = await familiar.openScreenRecordingSettings()
      if (!result || result.ok !== true) {
        console.error('Failed to open Screen Recording settings', result?.message || result)
      }
    } catch (error) {
      console.error('Failed to open Screen Recording settings', error)
    }
  }

  return {
    permissionCheckState,
    checkPermissions,
    toggleCapture,
    openScreenRecordingSettings
  }
}
