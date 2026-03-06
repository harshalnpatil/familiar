const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test, expect } = require('playwright/test')
const { _electron: electron } = require('playwright')
const { confirmMoveContextFolder } = require('./helpers')

const { FAMILIAR_BEHIND_THE_SCENES_DIR_NAME, STILLS_DIR_NAME, STILLS_MARKDOWN_DIR_NAME } = require('../../src/const')

test.describe('clipboard mirroring', () => {
  test('mirrors clipboard text into the current stills-markdown session while recording', async () => {
    const appRoot = path.join(__dirname, '../..')
    const sourceContextPath = fs.mkdtempSync(path.join(os.tmpdir(), 'familiar-context-source-'))
    fs.mkdirSync(path.join(sourceContextPath, 'familiar'), { recursive: true })
    const contextPath = fs.mkdtempSync(path.join(os.tmpdir(), 'familiar-context-clipboard-'))
    const settingsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'familiar-settings-e2e-'))
    fs.writeFileSync(
      path.join(settingsDir, 'settings.json'),
      JSON.stringify(
        {
          wizardCompleted: true,
          contextFolderPath: sourceContextPath
        },
        null,
        2
      )
    )
    const launchArgs = ['.']

    const electronApp = await electron.launch({
      args: launchArgs,
      cwd: appRoot,
      env: {
        ...process.env,
        FAMILIAR_E2E: '1',
        FAMILIAR_E2E_CONTEXT_PATH: contextPath,
        FAMILIAR_SETTINGS_DIR: settingsDir
      }
    })

    try {
      await electronApp.evaluate(({ clipboard }) => {
        globalThis.__FAMILIAR_TEST_CLIPBOARD_TEXT = ''
        globalThis.__FAMILIAR_TEST_CLIPBOARD_IMAGE = null
        clipboard.readText = () => globalThis.__FAMILIAR_TEST_CLIPBOARD_TEXT
        clipboard.readImage = () => ({
          isEmpty: () => !globalThis.__FAMILIAR_TEST_CLIPBOARD_IMAGE,
          toPNG: () => globalThis.__FAMILIAR_TEST_CLIPBOARD_IMAGE || Buffer.alloc(0)
        })
      })

      const window = await electronApp.firstWindow()
      await window.waitForLoadState('domcontentloaded')

      // Configure context folder.
      await window.getByRole('tab', { name: 'Storage' }).click()
      const confirmDialog = confirmMoveContextFolder(window)
      await window.locator('#recording-move-folder').click()
      await confirmDialog
      await expect(window.locator('#context-folder-status')).toHaveText('Saved.')

      // Enable recording while active (required for manual start).
      const enableResult = await window.evaluate(() => window.familiar.saveSettings({ alwaysRecordWhenActive: true }))
      expect(enableResult?.ok).toBe(true)

      const startResult = await window.evaluate(() => window.familiar.startScreenStills())
      expect(startResult?.ok).toBe(true)

      const stillsRoot = path.join(contextPath, FAMILIAR_BEHIND_THE_SCENES_DIR_NAME, STILLS_DIR_NAME)
      await expect
        .poll(() => {
          if (!fs.existsSync(stillsRoot)) return []
          return fs.readdirSync(stillsRoot).filter((name) => name.startsWith('session-'))
        }, { timeout: 15000 })
        .toHaveLength(1)

      const [sessionId] = fs.readdirSync(stillsRoot).filter((name) => name.startsWith('session-'))
      const markdownSessionDir = path.join(
        contextPath,
        FAMILIAR_BEHIND_THE_SCENES_DIR_NAME,
        STILLS_MARKDOWN_DIR_NAME,
        sessionId
      )

      await electronApp.evaluate(() => {
        globalThis.__FAMILIAR_TEST_CLIPBOARD_TEXT = 'hello from clipboard'
      })

      await expect
        .poll(() => {
          if (!fs.existsSync(markdownSessionDir)) return []
          return fs.readdirSync(markdownSessionDir).filter((name) => name.endsWith('.clipboard.txt'))
        }, { timeout: 15000 })
        .toHaveLength(1)

      const [clipboardFile] = fs.readdirSync(markdownSessionDir).filter((name) => name.endsWith('.clipboard.txt'))
      const contents = fs.readFileSync(path.join(markdownSessionDir, clipboardFile), 'utf-8')
      expect(contents).toBe('hello from clipboard')
    } finally {
      await electronApp.close()
    }
  })

  test('does not mirror one-word clipboard text while recording', async () => {
    const appRoot = path.join(__dirname, '../..')
    const sourceContextPath = fs.mkdtempSync(path.join(os.tmpdir(), 'familiar-context-source-'))
    fs.mkdirSync(path.join(sourceContextPath, 'familiar'), { recursive: true })
    const contextPath = fs.mkdtempSync(path.join(os.tmpdir(), 'familiar-context-clipboard-single-word-'))
    const settingsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'familiar-settings-e2e-'))
    fs.writeFileSync(
      path.join(settingsDir, 'settings.json'),
      JSON.stringify(
        {
          wizardCompleted: true,
          contextFolderPath: sourceContextPath
        },
        null,
        2
      )
    )
    const launchArgs = ['.']

    const electronApp = await electron.launch({
      args: launchArgs,
      cwd: appRoot,
      env: {
        ...process.env,
        FAMILIAR_E2E: '1',
        FAMILIAR_E2E_CONTEXT_PATH: contextPath,
        FAMILIAR_SETTINGS_DIR: settingsDir
      }
    })

    try {
      await electronApp.evaluate(({ clipboard }) => {
        globalThis.__FAMILIAR_TEST_CLIPBOARD_TEXT = ''
        globalThis.__FAMILIAR_TEST_CLIPBOARD_IMAGE = null
        clipboard.readText = () => globalThis.__FAMILIAR_TEST_CLIPBOARD_TEXT
        clipboard.readImage = () => ({
          isEmpty: () => !globalThis.__FAMILIAR_TEST_CLIPBOARD_IMAGE,
          toPNG: () => globalThis.__FAMILIAR_TEST_CLIPBOARD_IMAGE || Buffer.alloc(0)
        })
      })

      const window = await electronApp.firstWindow()
      await window.waitForLoadState('domcontentloaded')

      await window.getByRole('tab', { name: 'Storage' }).click()
      const confirmDialog = confirmMoveContextFolder(window)
      await window.locator('#recording-move-folder').click()
      await confirmDialog
      await expect(window.locator('#context-folder-status')).toHaveText('Saved.')

      const enableResult = await window.evaluate(() => window.familiar.saveSettings({ alwaysRecordWhenActive: true }))
      expect(enableResult?.ok).toBe(true)

      const startResult = await window.evaluate(() => window.familiar.startScreenStills())
      expect(startResult?.ok).toBe(true)

      const stillsRoot = path.join(contextPath, FAMILIAR_BEHIND_THE_SCENES_DIR_NAME, STILLS_DIR_NAME)
      await expect
        .poll(() => {
          if (!fs.existsSync(stillsRoot)) return []
          return fs.readdirSync(stillsRoot).filter((name) => name.startsWith('session-'))
        }, { timeout: 15000 })
        .toHaveLength(1)

      const [sessionId] = fs.readdirSync(stillsRoot).filter((name) => name.startsWith('session-'))
      const markdownSessionDir = path.join(
        contextPath,
        FAMILIAR_BEHIND_THE_SCENES_DIR_NAME,
        STILLS_MARKDOWN_DIR_NAME,
        sessionId
      )

      await electronApp.evaluate(() => {
        globalThis.__FAMILIAR_TEST_CLIPBOARD_TEXT = 'password123'
      })

      await window.waitForTimeout(1300)

      const mirroredFiles = fs.existsSync(markdownSessionDir)
        ? fs.readdirSync(markdownSessionDir).filter((name) => name.endsWith('.clipboard.txt'))
        : []
      expect(mirroredFiles).toHaveLength(0)
    } finally {
      await electronApp.close()
    }
  })

  test('mirrors clipboard image into stills session and writes .clipboard markdown output', async () => {
    test.skip(process.platform !== 'darwin', 'Clipboard image OCR is only supported on macOS.')

    const appRoot = path.join(__dirname, '../..')
    const sourceContextPath = fs.mkdtempSync(path.join(os.tmpdir(), 'familiar-context-source-'))
    fs.mkdirSync(path.join(sourceContextPath, 'familiar'), { recursive: true })
    const contextPath = fs.mkdtempSync(path.join(os.tmpdir(), 'familiar-context-clipboard-image-'))
    const settingsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'familiar-settings-e2e-'))
    const clipboardImagePath = path.join(os.tmpdir(), `familiar-clipboard-image-${Date.now()}.png`)
    fs.writeFileSync(
      path.join(settingsDir, 'settings.json'),
      JSON.stringify(
        {
          wizardCompleted: true,
          contextFolderPath: sourceContextPath
        },
        null,
        2
      )
    )

    const electronApp = await electron.launch({
      args: ['.'],
      cwd: appRoot,
      env: {
        ...process.env,
        FAMILIAR_E2E: '1',
        FAMILIAR_E2E_CONTEXT_PATH: contextPath,
        FAMILIAR_E2E_CLIPBOARD_IMAGE_PATH: clipboardImagePath,
        FAMILIAR_SETTINGS_DIR: settingsDir
      }
    })

    try {
      await electronApp.evaluate(({ clipboard }) => {
        globalThis.__FAMILIAR_TEST_CLIPBOARD_TEXT = ''
        globalThis.__FAMILIAR_TEST_CLIPBOARD_IMAGE = null
        clipboard.readText = () => globalThis.__FAMILIAR_TEST_CLIPBOARD_TEXT
        clipboard.readImage = () => ({
          isEmpty: () => !globalThis.__FAMILIAR_TEST_CLIPBOARD_IMAGE,
          toPNG: () => globalThis.__FAMILIAR_TEST_CLIPBOARD_IMAGE || Buffer.alloc(0)
        })
      })

      const window = await electronApp.firstWindow()
      await window.waitForLoadState('domcontentloaded')

      await window.getByRole('tab', { name: 'Storage' }).click()
      const confirmDialog = confirmMoveContextFolder(window)
      await window.locator('#recording-move-folder').click()
      await confirmDialog
      await expect(window.locator('#context-folder-status')).toHaveText('Saved.')

      const extractorResult = await window.evaluate(() =>
        window.familiar.saveSettings({ alwaysRecordWhenActive: true })
      )
      expect(extractorResult?.ok).toBe(true)

      const startResult = await window.evaluate(() => window.familiar.startScreenStills())
      expect(startResult?.ok).toBe(true)

      const stillsRoot = path.join(contextPath, FAMILIAR_BEHIND_THE_SCENES_DIR_NAME, STILLS_DIR_NAME)
      await expect
        .poll(() => {
          if (!fs.existsSync(stillsRoot)) return []
          return fs.readdirSync(stillsRoot).filter((name) => name.startsWith('session-'))
        }, { timeout: 15000 })
        .toHaveLength(1)

      const [sessionId] = fs.readdirSync(stillsRoot).filter((name) => name.startsWith('session-'))
      const stillsSessionDir = path.join(stillsRoot, sessionId)
      const markdownSessionDir = path.join(
        contextPath,
        FAMILIAR_BEHIND_THE_SCENES_DIR_NAME,
        STILLS_MARKDOWN_DIR_NAME,
        sessionId
      )

      const clipboardImageBase64 = await window.evaluate(async () => {
        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 256
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          throw new Error('Failed to create canvas context')
        }
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#111111'
        ctx.font = '28px sans-serif'
        ctx.fillText('Clipboard', 24, 112)
        ctx.fillText('image', 24, 156)

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
        if (!blob) {
          throw new Error('Failed to encode PNG blob')
        }

        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result || ''))
          reader.onerror = () => reject(new Error('Failed to read PNG data URL'))
          reader.readAsDataURL(blob)
        })

        const parts = String(dataUrl).split(',')
        return parts.length > 1 ? parts[1] : ''
      })
      expect(clipboardImageBase64).toBeTruthy()
      fs.writeFileSync(clipboardImagePath, Buffer.from(clipboardImageBase64, 'base64'))

      await electronApp.evaluate(() => {
        const fsLocal = process.mainModule.require('node:fs')
        const imagePath = process.env.FAMILIAR_E2E_CLIPBOARD_IMAGE_PATH
        if (typeof imagePath !== 'string' || !imagePath) {
          throw new Error('Missing FAMILIAR_E2E_CLIPBOARD_IMAGE_PATH.')
        }
        globalThis.__FAMILIAR_TEST_CLIPBOARD_IMAGE = fsLocal.readFileSync(imagePath)
      })

      await expect
        .poll(() => {
          if (!fs.existsSync(stillsSessionDir)) return []
          return fs.readdirSync(stillsSessionDir).filter((name) => name.endsWith('.clipboard.png'))
        }, { timeout: 15000 })
        .toHaveLength(1)

      await expect
        .poll(() => {
          if (!fs.existsSync(markdownSessionDir)) return []
          return fs.readdirSync(markdownSessionDir).filter((name) => name.endsWith('.clipboard.md'))
        }, { timeout: 15000 })
        .toHaveLength(1)

      const [markdownFile] = fs.readdirSync(markdownSessionDir).filter((name) => name.endsWith('.clipboard.md'))
      const markdownContents = fs.readFileSync(path.join(markdownSessionDir, markdownFile), 'utf-8')
      expect(markdownContents).toContain('# OCR')
    } finally {
      await electronApp.close()
      fs.rmSync(clipboardImagePath, { force: true })
    }
  })
})
