const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const resetModule = (modulePath) => {
  const resolved = require.resolve(modulePath);
  delete require.cache[resolved];
};

test('registerCapabilityHandlers registers platform:getCapabilities IPC handler', async () => {
  const handlers = {};
  const stubElectron = {
    ipcMain: {
      handle: (channel, handler) => {
        handlers[channel] = handler;
      }
    }
  };

  const originalLoad = Module._load;
  Module._load = function (request, parent, isMain) {
    if (request === 'electron') {
      return stubElectron;
    }
    return originalLoad.call(this, request, parent, isMain);
  };

  resetModule('../src/ipc/capabilities');

  try {
    const { registerCapabilityHandlers } = require('../src/ipc/capabilities');
    registerCapabilityHandlers({
      resolveCapabilities: () => ({
        platform: 'darwin',
        features: {
          screenCapture: { supported: true, reason: 'ok' }
        }
      })
    });

    assert.equal(typeof handlers['platform:getCapabilities'], 'function');
    const payload = await handlers['platform:getCapabilities']();
    assert.equal(payload.platform, 'darwin');
    assert.equal(payload.features.screenCapture.supported, true);
  } finally {
    Module._load = originalLoad;
    resetModule('../src/ipc/capabilities');
  }
});
