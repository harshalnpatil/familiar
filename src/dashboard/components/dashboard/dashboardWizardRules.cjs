const WIZARD_STEPS = [1, 2, 3, 4]

const isWizardStepComplete = ({ step, settings = {}, isSkillInstalled = false, getHarnessesFromState }) => {
  switch (step) {
    case 1:
      return Boolean(settings.contextFolderPath)
    case 2:
      return Boolean(settings.alwaysRecordWhenActive)
    case 3: {
      const harnesses = typeof getHarnessesFromState === 'function' ? getHarnessesFromState() : []
      return Array.isArray(harnesses) && harnesses.length > 0 && isSkillInstalled
    }
    case 4:
      return Boolean(isSkillInstalled)
    default:
      return false
  }
}

const nextWizardStep = (step) => {
  const parsed = Number(step)
  if (!Number.isFinite(parsed)) {
    return 1
  }
  return Math.min(4, Math.max(1, Math.round(parsed) + 1))
}

const previousWizardStep = (step) => {
  const parsed = Number(step)
  if (!Number.isFinite(parsed)) {
    return 1
  }
  return Math.max(1, Math.round(parsed) - 1)
}

const isValidWizardStep = (step) => {
  return WIZARD_STEPS.includes(Number(step))
}

module.exports = {
  WIZARD_STEPS,
  isWizardStepComplete,
  nextWizardStep,
  previousWizardStep,
  isValidWizardStep
}
