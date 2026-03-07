const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')

const { openTextInTextEdit } = require('../src/utils/open-text-in-textedit')

test('openTextInTextEdit writes the failure text to a temp file and opens it in TextEdit', async () => {
  const writeCalls = []
  const openCalls = []

  const result = await openTextInTextEdit({
    text: 'Heartbeat execution timed out after 30s',
    mkdtempFn: async (prefix) => `${prefix}abc123`,
    writeFileFn: async (...args) => {
      writeCalls.push(args)
    },
    tmpdirFn: () => '/tmp',
    pathModule: path.posix,
    openFileInTextEditFn: async ({ targetPath }) => {
      openCalls.push(targetPath)
      return { ok: true, targetPath }
    }
  })

  assert.deepEqual(writeCalls, [[
    '/tmp/familiar-heartbeat-failure-abc123/heartbeat-failure.txt',
    'Heartbeat execution timed out after 30s',
    'utf-8'
  ]])
  assert.deepEqual(openCalls, [
    '/tmp/familiar-heartbeat-failure-abc123/heartbeat-failure.txt'
  ])
  assert.deepEqual(result, {
    ok: true,
    targetPath: '/tmp/familiar-heartbeat-failure-abc123/heartbeat-failure.txt'
  })
})

test('openTextInTextEdit rejects blank text', async () => {
  await assert.rejects(
    () => openTextInTextEdit({
      text: '   ',
      mkdtempFn: async () => '/tmp/unused',
      writeFileFn: async () => {},
      openFileInTextEditFn: async () => {}
    }),
    /text is required to open TextEdit/
  )
})
