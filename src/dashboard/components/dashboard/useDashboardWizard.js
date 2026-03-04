import dashboardWizardRules from './dashboardWizardRules.cjs'
import dashboardWizardCompletionRules from './dashboardWizardCompletionRules.cjs'
import { useCallback } from 'react'

export const useDashboardWizard = ({
  mc,
  settings,
  wizardStep,
  isSkillInstalled,
  getHarnessesFromState,
  saveSettings,
  setWizardStep,
  setWizardError,
  setWizardMessage,
  setActiveSection,
  setIsWizardCompleted
}) => {
  const {
    isWizardStepComplete: isWizardStepCompleteRule,
    nextWizardStep,
    previousWizardStep
  } = dashboardWizardRules
  const { resolveWizardCompletion } = dashboardWizardCompletionRules
  const isWizardStepComplete = useCallback(
    (step) => {
      return isWizardStepCompleteRule({
        step,
        settings,
        isSkillInstalled,
        getHarnessesFromState
      })
    },
    [getHarnessesFromState, isSkillInstalled, settings.alwaysRecordWhenActive, settings.contextFolderPath]
  )

  const goWizardNext = useCallback(() => {
    if (!isWizardStepComplete(wizardStep)) {
      setWizardError(mc.dashboard.wizard.completeStepToContinue)
      return
    }
    setWizardError('')
    setWizardStep(nextWizardStep)
  }, [isWizardStepComplete, mc.dashboard.wizard.completeStepToContinue, setWizardError, setWizardStep, wizardStep])

  const goWizardBack = useCallback(() => {
    setWizardStep(previousWizardStep)
  }, [setWizardStep])

  const completeWizard = useCallback(async () => {
    const result = await resolveWizardCompletion({
      wizardStep,
      isWizardStepComplete,
      saveSettings,
      mc
    })
    if (!result.ok) {
      if (result.showError) {
        setWizardError(result.error)
      }
      return
    }

    setIsWizardCompleted(true)
    setActiveSection(result.nextSection)
    if (result.clearError) {
      setWizardError('')
    }
    if (result.message) {
      setWizardMessage(result.message)
    }
  }, [
    isWizardStepComplete,
    mc,
    saveSettings,
    setActiveSection,
    setIsWizardCompleted,
    setWizardError,
    setWizardMessage,
    wizardStep
  ])

  return {
    isWizardStepComplete,
    goWizardNext,
    goWizardBack,
    completeWizard
  }
}
