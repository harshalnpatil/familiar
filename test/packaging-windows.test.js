const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const appRoot = path.join(__dirname, '..');

test('package scripts build windows dist for all, x64, and arm64', () => {
    const packageJsonPath = path.join(appRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    assert.equal(
        packageJson.scripts['dist:win'],
        'npm run clean && npm run css:build && electron-builder --win --x64 --arm64'
    );
    assert.equal(
        packageJson.scripts['dist:win:x64'],
        'npm run clean && npm run css:build && electron-builder --win --x64'
    );
    assert.equal(
        packageJson.scripts['dist:win:arm64'],
        'npm run clean && npm run css:build && electron-builder --win --arm64'
    );
});

test('windows build config includes nsis + portable targets, icon, and release channel metadata', () => {
    const packageJsonPath = path.join(appRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const winTargets = Array.isArray(packageJson.build?.win?.target) ? packageJson.build.win.target : [];

    assert.equal(
        winTargets.some((target) => target.target === 'nsis'),
        true
    );
    assert.equal(
        winTargets.some((target) => target.target === 'portable'),
        true
    );
    assert.equal(packageJson.build?.win?.icon, 'build/icon.png');
    assert.equal(packageJson.build?.generateUpdatesFilesForAllChannels, true);
    assert.equal(Array.isArray(packageJson.build?.publish), true);
    assert.equal(
        packageJson.build.publish.every((publishTarget) => publishTarget.channel === 'latest'),
        true
    );
});
