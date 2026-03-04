const assert = require('node:assert')

const confirmMoveContextFolder = async (window) => {
  const confirmState = {
    message: '',
    invoked: false
  }

  await window.evaluate((state) => {
    if (typeof window.confirm !== 'function' || window.confirm.__familiarAutoConfirmContextFolder === true) {
      if (window.__familiarAutoConfirmContextFolderState) {
        window.__familiarAutoConfirmContextFolderState.invoked = false
        window.__familiarAutoConfirmContextFolderState.message = ''
      }
      return
    }

    const autoConfirm = (message) => {
      const nextMessage = String(message || '')
      const normalizedState = window.__familiarAutoConfirmContextFolderState
      if (normalizedState) {
        normalizedState.invoked = true
        normalizedState.message = nextMessage
      }
      if (/context folder/i.test(nextMessage)) {
        return true
      }
      const originalConfirm = window.__familiarAutoConfirmOriginalConfirm
      return originalConfirm ? originalConfirm(message) : true
    }

    window.__familiarAutoConfirmContextFolderState = { ...state, invoked: false, message: '' }
    window.__familiarAutoConfirmOriginalConfirm = window.confirm
    autoConfirm.__familiarAutoConfirmContextFolder = true
    window.confirm = autoConfirm
  }, confirmState)

  const dialogResult = window.waitForEvent('dialog').then(async (dialog) => {
    assert.equal(dialog.type(), 'confirm', 'Expected a confirm dialog when moving context folder')
    const message = String(dialog.message() || '')
    assert.match(
      message.toLowerCase(),
      /context folder/,
      'Expected context folder move confirmation message'
    )
    await dialog.accept()
    return { type: 'page-dialog', message }
  })

  const fallbackResult = window
    .waitForFunction(() => {
      return window.__familiarAutoConfirmContextFolderState?.invoked === true
    })
    .then(async () => {
      const state = await window.evaluate(() => {
        const { invoked = false, message = '' } = window.__familiarAutoConfirmContextFolderState || {}
        return {
          invoked,
          message: String(message || '')
        }
      })

      assert.ok(state.invoked, 'Expected window.confirm to be invoked when moving context folder')
      assert.match(state.message.toLowerCase(), /context folder/, 'Expected context folder move confirmation message')

      return {
        type: 'window-confirm',
        message: state.message
      }
    })

  return Promise.race([dialogResult, fallbackResult])
}

module.exports = {
  confirmMoveContextFolder
}
