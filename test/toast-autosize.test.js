const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const resetToastModule = () => {
    const toastPath = require.resolve('../src/toast');
    delete require.cache[toastPath];
};

test('toast autosize logs warning on measurement failure', async () => {
    const warnCalls = [];
    const originalWarn = console.warn;
    console.warn = (...args) => warnCalls.push(args);

    const stubElectron = {
        BrowserWindow: class {
            constructor({ width, height, x, y }) {
                this._bounds = { width, height, x, y };
                this._destroyed = false;
                this.webContents = {
                    send: () => {},
                    executeJavaScript: () => Promise.reject(new Error('boom')),
                };
            }

            getSize() {
                return [this._bounds.width, this._bounds.height];
            }

            getBounds() {
                return this._bounds;
            }

            setBounds(bounds) {
                this._bounds = { ...this._bounds, ...bounds };
            }

            isDestroyed() {
                return this._destroyed;
            }

            destroy() {
                this._destroyed = true;
            }

            showInactive() {}

            hide() {}

            loadFile() {}

            once(_event, callback) {
                callback();
            }

            on() {}
        },
        screen: {
            getPrimaryDisplay: () => ({ workArea: { x: 0, y: 0, width: 800, height: 600 } }),
            getDisplayMatching: () => ({ workArea: { x: 0, y: 0, width: 800, height: 600 } }),
        },
        ipcMain: { on: () => {} },
        shell: { showItemInFolder: () => {} },
    };

    const originalLoad = Module._load;
    Module._load = function (request, parent, isMain) {
        if (request === 'electron') {
            return stubElectron;
        }
        return originalLoad.call(this, request, parent, isMain);
    };

    resetToastModule();

    try {
        const { showToast, destroyToast } = require('../src/toast');
        showToast({ title: 'Test', body: 'Body', duration: 1 });
        await new Promise((resolve) => setImmediate(resolve));

        assert.ok(warnCalls.some((args) => args[0] === 'Toast autosize failed'));

        destroyToast();
    } finally {
        console.warn = originalWarn;
        Module._load = originalLoad;
        resetToastModule();
    }
});

test('toast sends closable flag to renderer payload by default', async () => {
    const sentPayloads = [];
    const originalWarn = console.warn;
    console.warn = () => {}

    const stubElectron = {
        BrowserWindow: class {
            constructor({ width, height, x, y }) {
                this._bounds = { width, height, x, y };
                this._destroyed = false;
                this.webContents = {
                    send: (_event, payload) => {
                        sentPayloads.push(payload);
                    },
                    executeJavaScript: () => Promise.resolve(0),
                };
            }

            getSize() {
                return [this._bounds.width, this._bounds.height];
            }

            getBounds() {
                return this._bounds;
            }

            setBounds(bounds) {
                this._bounds = { ...this._bounds, ...bounds };
            }

            isDestroyed() {
                return this._destroyed;
            }

            destroy() {
                this._destroyed = true;
            }

            showInactive() {}

            hide() {}

            loadFile() {}

            once(_event, callback) {
                callback();
            }

            on() {}
        },
        screen: {
            getPrimaryDisplay: () => ({ workArea: { x: 0, y: 0, width: 800, height: 600 } }),
            getDisplayMatching: () => ({ workArea: { x: 0, y: 0, width: 800, height: 600 } }),
        },
        ipcMain: {
            on: () => {},
            removeListener: () => {}
        },
        shell: { showItemInFolder: () => {} },
    };

    const originalLoad = Module._load;
    Module._load = function (request, parent, isMain) {
        if (request === 'electron') {
            return stubElectron;
        }
        return originalLoad.call(this, request, parent, isMain);
    };

    resetToastModule();

    try {
        const { showToast, destroyToast } = require('../src/toast');
        showToast({ title: 'Test', body: 'Body', size: 'compact' });
        await new Promise((resolve) => setImmediate(resolve));

        assert.equal(sentPayloads.length >= 1, true);
        assert.equal(sentPayloads[0].closable, true);

        destroyToast();
    } finally {
        console.warn = originalWarn;
        Module._load = originalLoad;
        resetToastModule();
    }
});

test('toast action open-in-folder opens the configured path in Finder', async () => {
    const sentPayloads = [];
    const showItemInFolderCalls = [];
    const actionHandlers = {};
    const originalWarn = console.warn;
    console.warn = () => {};

    const stubElectron = {
        BrowserWindow: class {
            constructor({ width, height, x, y }) {
                this._bounds = { width, height, x, y };
                this._destroyed = false;
                this.webContents = {
                    send: (_event, payload) => {
                        sentPayloads.push(payload);
                    },
                    executeJavaScript: () => Promise.resolve(0),
                };
            }

            getSize() {
                return [this._bounds.width, this._bounds.height];
            }

            getBounds() {
                return this._bounds;
            }

            setBounds(bounds) {
                this._bounds = { ...this._bounds, ...bounds };
            }

            isDestroyed() {
                return this._destroyed;
            }

            destroy() {
                this._destroyed = true;
            }

            showInactive() {}

            hide() {}

            loadFile() {}

            once(_event, callback) {
                callback();
            }

            on() {}
        },
        screen: {
            getPrimaryDisplay: () => ({ workArea: { x: 0, y: 0, width: 800, height: 600 } }),
            getDisplayMatching: () => ({ workArea: { x: 0, y: 0, width: 800, height: 600 } }),
        },
        ipcMain: {
            on: (event, callback) => {
                actionHandlers[event] = callback;
            },
            removeListener: () => {}
        },
        shell: {
            showItemInFolder: (value) => {
                showItemInFolderCalls.push(value);
            }
        },
    };

    const originalLoad = Module._load;
    Module._load = function (request, parent, isMain) {
        if (request === 'electron') {
            return stubElectron;
        }
        return originalLoad.call(this, request, parent, isMain);
    };

    resetToastModule();

    try {
        const { showToast, destroyToast } = require('../src/toast');
        showToast({
            title: 'Test',
            body: 'Open the containing folder for this file.',
            size: 'large',
            duration: 10_000,
            actions: [{ label: 'Open in Finder', action: 'open-in-folder', data: '/tmp/familiar.log' }],
            closable: true
        });
        await new Promise((resolve) => setImmediate(resolve));

        assert.equal(sentPayloads.length >= 1, true);
        assert.equal(sentPayloads[sentPayloads.length - 1].duration, 10_000);
        assert.equal(showItemInFolderCalls.length, 0);

        assert.equal(typeof actionHandlers['toast-action'], 'function');
        actionHandlers['toast-action']({}, { action: 'open-in-folder', data: '/tmp/familiar.log' });
        await new Promise((resolve) => setImmediate(resolve));

        assert.deepEqual(showItemInFolderCalls, ['/tmp/familiar.log']);

        destroyToast();
    } finally {
        console.warn = originalWarn;
        Module._load = originalLoad;
        resetToastModule();
    }
});
