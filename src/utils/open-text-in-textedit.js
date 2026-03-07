const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')

const { openFileInTextEdit } = require('./open-in-textedit')

const DEFAULT_TEMP_DIR_PREFIX = 'familiar-heartbeat-failure-'
const DEFAULT_FILE_NAME = 'heartbeat-failure.txt'

const openTextInTextEdit = async ({
  text,
  tempDirPrefix = DEFAULT_TEMP_DIR_PREFIX,
  fileName = DEFAULT_FILE_NAME,
  mkdtempFn = fs.mkdtemp,
  writeFileFn = fs.writeFile,
  tmpdirFn = os.tmpdir,
  pathModule = path,
  openFileInTextEditFn = openFileInTextEdit
} = {}) => {
  if (typeof text !== 'string' || text.trim().length === 0) {
    throw new Error('text is required to open TextEdit.')
  }

  const targetDir = await mkdtempFn(pathModule.join(tmpdirFn(), tempDirPrefix))
  const targetPath = pathModule.join(targetDir, fileName)

  await writeFileFn(targetPath, text, 'utf-8')
  await openFileInTextEditFn({ targetPath })

  return {
    ok: true,
    targetPath
  }
}

module.exports = {
  openTextInTextEdit
}
