const resolvePermissionStateFromResult = (result) => {
  if (!result || typeof result !== 'object') {
    return null
  }
  if (typeof result.permissionStatus !== 'string') {
    return null
  }

  return {
    permissionStatus: result.permissionStatus,
    permissionGranted:
      result.permissionGranted === true ||
      result.permissionStatus === 'granted' ||
      result.permissionStatus === 'authorized' ||
      result.permissionStatus === 'allowed'
  }
}

const isGrantedPermissionResult = (result) => {
  if (!result || typeof result !== 'object') {
    return false
  }

  if (result.permissionStatus === 'granted') {
    return true
  }

  if (typeof result.permissionGranted === 'boolean') {
    return result.permissionGranted === true
  }

  if (typeof result.permissionGranted === 'string') {
    return result.permissionGranted === 'granted'
  }

  return false
}

const resolvePermissionCheckState = (result) => {
  return isGrantedPermissionResult(result) ? 'granted' : 'denied'
}

const resolvePermissionStateFromFamiliar = async (familiar) => {
  const requestApi = familiar?.requestScreenRecordingPermission
  const checkApi = familiar?.checkScreenRecordingPermission
  let result = null

  if (typeof requestApi === 'function') {
    result = await requestApi()
  } else if (typeof checkApi === 'function') {
    result = await checkApi()
  }

  if ((!result || !result.permissionStatus) && typeof checkApi === 'function') {
    result = await checkApi()
  }

  return result
}

module.exports = {
  resolvePermissionStateFromFamiliar,
  resolvePermissionStateFromResult,
  isGrantedPermissionResult,
  resolvePermissionCheckState
}
