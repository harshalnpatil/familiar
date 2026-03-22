const { registerSettingsHandlers } = require('./settings');
const { registerStillsHandlers } = require('./stills');
const { registerUpdateHandlers } = require('./updates');
const { registerSkillHandlers } = require('./skills');
const { registerLogsHandlers } = require('./logs');
const { registerStorageHandlers } = require('./storage');
const { registerHeartbeatsHandlers } = require('./heartbeats');
const { registerCapabilityHandlers } = require('./capabilities');

/**
 * Registers all IPC handlers for the main process.
 */
function registerIpcHandlers(options = {}) {
    registerSettingsHandlers({
        onSettingsSaved: options.onSettingsSaved,
        onMoveContextFolder: options.onMoveContextFolder
    });
    registerStillsHandlers();
    registerUpdateHandlers();
    registerSkillHandlers();
    registerLogsHandlers();
    registerStorageHandlers();
    registerCapabilityHandlers({
        resolveCapabilities: options.resolveCapabilities
    });
    registerHeartbeatsHandlers({
        runHeartbeatNow: options.runHeartbeatNow
    });
}

module.exports = {
    registerIpcHandlers,
    registerSettingsHandlers,
    registerStillsHandlers,
    registerUpdateHandlers,
    registerSkillHandlers,
    registerLogsHandlers,
    registerStorageHandlers,
    registerCapabilityHandlers,
    registerHeartbeatsHandlers,
};
