const test = require('node:test')
const assert = require('node:assert/strict')

const {
  mergeHeartbeatsIntoSettings,
  shouldRefreshHeartbeatsOnSectionOpen,
  toSafeHeartbeats
} = require('../../src/dashboard/components/dashboard/heartbeat-refresh-utils.cjs')

test('toSafeHeartbeats returns items from payload when present', () => {
  const items = [{ id: 'hb-1' }]
  assert.deepEqual(toSafeHeartbeats({ heartbeats: { items } }), items)
})

test('toSafeHeartbeats falls back to empty array for invalid payloads', () => {
  assert.deepEqual(toSafeHeartbeats({ heartbeats: { items: null } }), [])
  assert.deepEqual(toSafeHeartbeats({}), [])
})

test('mergeHeartbeatsIntoSettings replaces only the heartbeats items', () => {
  const previous = {
    contextFolderPath: '/tmp/context',
    alwaysRecordWhenActive: true,
    heartbeats: {
      items: [{ id: 'hb-old' }],
      extraField: 'keep-me'
    }
  }

  const next = mergeHeartbeatsIntoSettings(previous, {
    heartbeats: {
      items: [{ id: 'hb-new' }]
    }
  })

  assert.equal(next.contextFolderPath, '/tmp/context')
  assert.equal(next.alwaysRecordWhenActive, true)
  assert.equal(next.heartbeats.extraField, 'keep-me')
  assert.deepEqual(next.heartbeats.items, [{ id: 'hb-new' }])
})

test('shouldRefreshHeartbeatsOnSectionOpen triggers only when entering heartbeats', () => {
  assert.equal(
    shouldRefreshHeartbeatsOnSectionOpen({ previousSection: 'storage', activeSection: 'heartbeats' }),
    true
  )
  assert.equal(
    shouldRefreshHeartbeatsOnSectionOpen({ previousSection: 'heartbeats', activeSection: 'heartbeats' }),
    false
  )
  assert.equal(
    shouldRefreshHeartbeatsOnSectionOpen({ previousSection: 'storage', activeSection: 'recording' }),
    false
  )
})
