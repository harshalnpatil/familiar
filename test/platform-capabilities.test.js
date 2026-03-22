const test = require('node:test');
const assert = require('node:assert/strict');

const {
  SENSITIVE_FEATURES,
  getSensitiveFeatureCapabilities,
  isSensitiveFeatureSupported
} = require('../src/platform/capabilities');

test('reports screen recording permission as supported on macOS', () => {
  const capabilities = getSensitiveFeatureCapabilities({ platform: 'darwin', isE2E: false });
  assert.equal(capabilities.features[SENSITIVE_FEATURES.SCREEN_RECORDING_PERMISSION].supported, true);
  assert.match(capabilities.features[SENSITIVE_FEATURES.SCREEN_RECORDING_PERMISSION].reason, /macOS/i);
});

test('reports screen recording settings as unsupported on linux', () => {
  const capabilities = getSensitiveFeatureCapabilities({ platform: 'linux', isE2E: false });
  assert.equal(capabilities.features[SENSITIVE_FEATURES.SCREEN_RECORDING_SETTINGS].supported, false);
  assert.match(capabilities.features[SENSITIVE_FEATURES.SCREEN_RECORDING_SETTINGS].reason, /only available on macOS/i);
});

test('allows app runtime in E2E mode on non-macOS', () => {
  assert.equal(
    isSensitiveFeatureSupported(SENSITIVE_FEATURES.APP_RUNTIME, { platform: 'linux', isE2E: true }),
    true
  );
});
