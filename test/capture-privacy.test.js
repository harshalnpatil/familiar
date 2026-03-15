const test = require('node:test')
const assert = require('node:assert/strict')

const {
  normalizeBlacklistedApps,
  listVisibleApps,
  shouldSkipCaptureForBlacklistedApps
} = require('../src/screen-stills/capture-privacy')

test('normalizeBlacklistedApps removes empty entries and deduplicates by bundle id or name', () => {
  const apps = normalizeBlacklistedApps([
    null,
    {},
    { bundleId: 'com.apple.MobileSMS', name: 'Messages' },
    { bundleId: 'com.apple.MobileSMS', name: 'Messages duplicate' },
    { name: ' Slack ' },
    { name: 'slack' }
  ])

  assert.deepEqual(apps, [
    { bundleId: 'com.apple.MobileSMS', name: 'Messages' },
    { bundleId: null, name: 'Slack' }
  ])
})

test('listVisibleApps normalizes and sorts visible app identities', () => {
  const apps = listVisibleApps([
    { name: 'Code', bundleId: 'com.microsoft.VSCode' },
    { name: 'Messages', bundleId: 'com.apple.MobileSMS' },
    { name: 'Code', bundleId: 'com.microsoft.VSCode' }
  ])

  assert.deepEqual(apps, [
    { bundleId: 'com.microsoft.VSCode', name: 'Code' },
    { bundleId: 'com.apple.MobileSMS', name: 'Messages' }
  ])
})

test('shouldSkipCaptureForBlacklistedApps matches by bundle id first and app name fallback', () => {
  const result = shouldSkipCaptureForBlacklistedApps({
    visibleWindows: [
      { name: 'Slack', bundleId: 'com.tinyspeck.slackmacgap' },
      { name: 'Messages', bundleId: 'com.apple.MobileSMS' }
    ],
    blacklistedApps: [
      { bundleId: 'com.apple.MobileSMS', name: 'Messages' },
      { name: 'Slack' }
    ]
  })

  assert.equal(result.skip, true)
  assert.equal(result.matches.length, 2)
  assert.deepEqual(result.matches[0].blacklistedApp, {
    bundleId: null,
    name: 'Slack'
  })
  assert.deepEqual(result.matches[1].blacklistedApp, {
    bundleId: 'com.apple.MobileSMS',
    name: 'Messages'
  })
})
