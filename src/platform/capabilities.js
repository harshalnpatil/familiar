const SENSITIVE_FEATURES = Object.freeze({
  APP_RUNTIME: 'appRuntime',
  SCREEN_CAPTURE: 'screenCapture',
  SCREEN_RECORDING_PERMISSION: 'screenRecordingPermission',
  SCREEN_RECORDING_SETTINGS: 'screenRecordingSettings',
  TRAY: 'tray',
  TRAY_TEMPLATE_IMAGE: 'trayTemplateImage',
  LOGIN_ITEM_SETTINGS: 'loginItemSettings',
  WINDOW_CLOSE_TO_TRAY: 'windowCloseToTray',
  LINUX_CI_E2E_FLAGS: 'linuxCiE2EFlags'
});

function createFeatureState({ supported, reasonSupported, reasonUnsupported }) {
  const isSupported = supported === true;
  return {
    supported: isSupported,
    reason: isSupported ? reasonSupported : reasonUnsupported
  };
}

function getSensitiveFeatureCapabilities(options = {}) {
  const platform = typeof options.platform === 'string' && options.platform
    ? options.platform
    : process.platform;
  const isE2E = options.isE2E === true;

  const isDarwin = platform === 'darwin';
  const isLinux = platform === 'linux';
  const supportsMacRuntime = isDarwin || isE2E;

  return {
    platform,
    isE2E,
    features: {
      [SENSITIVE_FEATURES.APP_RUNTIME]: createFeatureState({
        supported: supportsMacRuntime,
        reasonSupported: isDarwin
          ? 'App runtime is supported on macOS.'
          : 'E2E mode permits non-macOS runtime for tests.',
        reasonUnsupported: 'Familiar desktop app currently supports macOS only.'
      }),
      [SENSITIVE_FEATURES.SCREEN_CAPTURE]: createFeatureState({
        supported: supportsMacRuntime,
        reasonSupported: isDarwin
          ? 'Screen capture is supported on macOS.'
          : 'E2E mode permits capture setup on non-macOS for tests.',
        reasonUnsupported: 'Screen capture is unavailable outside macOS.'
      }),
      [SENSITIVE_FEATURES.SCREEN_RECORDING_PERMISSION]: createFeatureState({
        supported: supportsMacRuntime,
        reasonSupported: isDarwin
          ? 'Screen Recording permission checks are available on macOS.'
          : 'E2E mode provides simulated Screen Recording permission checks.',
        reasonUnsupported: 'Screen Recording permission checks are only available on macOS.'
      }),
      [SENSITIVE_FEATURES.SCREEN_RECORDING_SETTINGS]: createFeatureState({
        supported: isDarwin,
        reasonSupported: 'System Screen Recording settings can be opened on macOS.',
        reasonUnsupported: 'Screen Recording settings are only available on macOS.'
      }),
      [SENSITIVE_FEATURES.TRAY]: createFeatureState({
        supported: isDarwin,
        reasonSupported: 'Tray integration is available on macOS.',
        reasonUnsupported: 'Tray integration is currently limited to macOS.'
      }),
      [SENSITIVE_FEATURES.TRAY_TEMPLATE_IMAGE]: createFeatureState({
        supported: isDarwin,
        reasonSupported: 'Tray template images are supported on macOS.',
        reasonUnsupported: 'Tray template images are unsupported on this platform.'
      }),
      [SENSITIVE_FEATURES.LOGIN_ITEM_SETTINGS]: createFeatureState({
        supported: isDarwin,
        reasonSupported: 'Login item settings are available on macOS.',
        reasonUnsupported: 'Login item settings are only available on macOS.'
      }),
      [SENSITIVE_FEATURES.WINDOW_CLOSE_TO_TRAY]: createFeatureState({
        supported: isDarwin,
        reasonSupported: 'Window close-to-tray behavior is enabled on macOS.',
        reasonUnsupported: 'Window close-to-tray behavior is unavailable on this platform.'
      }),
      [SENSITIVE_FEATURES.LINUX_CI_E2E_FLAGS]: createFeatureState({
        supported: isLinux,
        reasonSupported: 'Linux Electron flags can be applied when running in CI/E2E.',
        reasonUnsupported: 'Linux Electron flags are only relevant on Linux.'
      })
    }
  };
}

function getSensitiveFeatureCapability(featureName, options = {}) {
  const registry = getSensitiveFeatureCapabilities(options);
  return registry.features?.[featureName] || {
    supported: false,
    reason: 'Unknown sensitive feature.'
  };
}

function isSensitiveFeatureSupported(featureName, options = {}) {
  return getSensitiveFeatureCapability(featureName, options).supported === true;
}

module.exports = {
  SENSITIVE_FEATURES,
  getSensitiveFeatureCapabilities,
  getSensitiveFeatureCapability,
  isSensitiveFeatureSupported
};
