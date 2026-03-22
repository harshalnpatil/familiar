const { ipcMain } = require('electron');
const { getSensitiveFeatureCapabilities } = require('../platform/capabilities');

function registerCapabilityHandlers(options = {}) {
  const resolveCapabilities = typeof options.resolveCapabilities === 'function'
    ? options.resolveCapabilities
    : () => getSensitiveFeatureCapabilities();

  ipcMain.handle('platform:getCapabilities', () => resolveCapabilities());
}

module.exports = {
  registerCapabilityHandlers
};
