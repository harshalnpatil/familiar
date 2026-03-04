const assert = require('node:assert/strict')
const test = require('node:test')

const rules = require('../src/dashboard/components/dashboard/dashboardCapturePermissionRules.cjs')

test('permission check prefers request API when available', async () => {
  let requestCalls = 0
  let checkCalls = 0
  const result = await rules.resolvePermissionStateFromFamiliar({
    requestScreenRecordingPermission: async () => {
      requestCalls += 1
      return { permissionStatus: 'granted', permissionGranted: true }
    },
    checkScreenRecordingPermission: async () => {
      checkCalls += 1
      return { permissionStatus: 'denied', permissionGranted: false }
    }
  })

  assert.equal(requestCalls, 1)
  assert.equal(checkCalls, 0)
  assert.deepEqual(result, { permissionStatus: 'granted', permissionGranted: true })
  assert.equal(rules.resolvePermissionCheckState(result), 'granted')
})

test('permission check falls back to check API when request is unavailable', async () => {
  let checkCalls = 0
  const result = await rules.resolvePermissionStateFromFamiliar({
    requestScreenRecordingPermission: undefined,
    checkScreenRecordingPermission: async () => {
      checkCalls += 1
      return { permissionStatus: 'denied', permissionGranted: false }
    }
  })

  assert.equal(checkCalls, 1)
  assert.equal(rules.resolvePermissionCheckState(result), 'denied')
})

test('permission check falls back to check API when request result has no permissionStatus', async () => {
  let requestCalls = 0
  let checkCalls = 0
  const result = await rules.resolvePermissionStateFromFamiliar({
    requestScreenRecordingPermission: async () => {
      requestCalls += 1
      return { ok: true }
    },
    checkScreenRecordingPermission: async () => {
      checkCalls += 1
      return { permissionStatus: 'denied', permissionGranted: false }
    }
  })

  assert.equal(requestCalls, 1)
  assert.equal(checkCalls, 1)
  assert.deepEqual(result, { permissionStatus: 'denied', permissionGranted: false })
  assert.equal(rules.resolvePermissionCheckState(result), 'denied')
})

test('permission status grants when permissionStatus is granted', () => {
  assert.equal(rules.isGrantedPermissionResult({ permissionStatus: 'granted' }), true)
  assert.equal(rules.isGrantedPermissionResult({ permissionGranted: true }), true)
  assert.equal(rules.isGrantedPermissionResult({ permissionGranted: 'granted' }), true)
  assert.equal(rules.isGrantedPermissionResult({ permissionStatus: 'denied' }), false)
  assert.equal(rules.isGrantedPermissionResult({}), false)
})

test('permission state extraction respects granted aliases', () => {
  assert.deepEqual(
    rules.resolvePermissionStateFromResult({ permissionStatus: 'granted', permissionGranted: false }),
    { permissionStatus: 'granted', permissionGranted: true }
  )

  assert.deepEqual(
    rules.resolvePermissionStateFromResult({ permissionStatus: 'authorized', permissionGranted: false }),
    { permissionStatus: 'authorized', permissionGranted: true }
  )

  assert.deepEqual(
    rules.resolvePermissionStateFromResult({ permissionStatus: 'allowed', permissionGranted: false }),
    { permissionStatus: 'allowed', permissionGranted: true }
  )
})

test('permission state extraction ignores non-string status', () => {
  assert.equal(rules.resolvePermissionStateFromResult({ permissionStatus: null }), null)
  assert.equal(rules.resolvePermissionStateFromResult(null), null)
})
