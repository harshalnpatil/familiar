const { _electron: electron } = require('playwright')
const path = require('node:path')
const os = require('node:os')
const fs = require('node:fs')

const run = async () => {
  const appRoot = path.join(process.cwd(), '..', '..')
  const settingsDir = fs.mkdtempSync(path.join(os.tmpdir(), 'familiar-settings-e2e-'))
  const skillHomeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'familiar-skill-home-e2e-'))
  const contextPath = path.join(appRoot, 'test', 'fixtures', 'context')

  const launchArgs = ['.']
  if (process.platform === 'linux') {
    launchArgs.push('--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage')
  }

  const electronApp = await electron.launch({
    args: launchArgs,
    cwd: appRoot,
    env: {
      ...process.env,
      FAMILIAR_E2E: '1',
      FAMILIAR_E2E_CONTEXT_PATH: contextPath,
      FAMILIAR_SETTINGS_DIR: settingsDir,
      HOME: skillHomeDir,
      FAMILIAR_LLM_MOCK: '1',
      FAMILIAR_LLM_MOCK_TEXT: 'gibberish'
    }
  })

  const window = await electronApp.firstWindow()
  await window.waitForLoadState('domcontentloaded')

  const nextButton = window.locator('#wizard-next')

  console.log('Initial step1 visible?', await window.locator('[data-wizard-step="1"]').isVisible())

  await window.locator('#wizard-context-folder-choose').click()
  await nextButton.waitFor({ state: 'enabled', timeout: 120000 })
  console.log('Path value:', await window.locator('#wizard-context-folder-path').inputValue())
  console.log('Next enabled before click:', await nextButton.isEnabled())

  await nextButton.click()
  await window.waitForTimeout(500)

  const stepSnapshots = await window.$$eval('[data-wizard-step]', (nodes) =>
    nodes.map((node) => ({
      step: node.getAttribute('data-wizard-step'),
      className: node.className,
      visible: !!(node && node.offsetParent !== null)
    }))
  )
  console.log('Step snapshots:', stepSnapshots)
  console.log('has step2 in dom', await window.locator('[data-wizard-step="2"]').count())
  console.log('wizard-recording-toggle-section count:', await window.locator('#wizard-recording-toggle-section').count())
  if (await window.locator('#wizard-recording-toggle-section').count()) {
    console.log('toggle visible?', await window.locator('#wizard-recording-toggle-section').isVisible())
  }

  await electronApp.close()
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
