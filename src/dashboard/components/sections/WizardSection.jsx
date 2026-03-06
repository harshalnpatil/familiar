import React from 'react'
import { Button } from '../ui/button'
import { Checkbox } from '../ui/checkbox'
import { Input } from '../ui/input'
import { CardTitle } from '../ui/card'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion'
import { CLOUD_COWORK_GUIDE_URL } from '../dashboard/dashboardConstants'

export function WizardSection({
  mc,
  displayedContextFolderPath,
  wizardContextFolderPath,
  wizardStep,
  wizardError,
  permissionCheckState,
  settings,
  storageMessage,
  storageError,
  toDisplayText,
  isWizardStepComplete,
  goWizardBack,
  goWizardNext,
  completeWizard,
  pickContextFolder,
  checkPermissions,
  openScreenRecordingSettings,
  wizardHarnessOptions,
  selectedHarnesses,
  skillInstallPaths,
  handleHarnessChange,
  skillMessage,
  skillError,
  wizardClaudeCoworkGuideVisible,
  copyClaudeCoworkGuideLink,
  claudeCoworkGuideMessage,
  claudeCoworkGuideError,
  hideClaudeCoworkGuide,
  isSkillInstalled,
  wizardMessage,
  recordingStatus
}) {
  const html = mc.dashboard?.html || {}
  const sections = mc.dashboard?.sections || {}
  const wizardSection = sections.wizard || {}
  const wizardSkill = mc.dashboard?.wizardSkill || {}
  const wizardSkillMessages = wizardSkill.messages || {}

  const isPermissionCheckGranted = permissionCheckState === 'granted'
  const isPermissionCheckDenied = permissionCheckState === 'denied'
  const isCheckingPermissions = permissionCheckState === 'checking'
  const openScreenRecordingLabel = toDisplayText(html.wizardEnableFamiliarInScreenRecording)
    || 'Enable Familiar In Screen Recording'
  const checkPermissionsLabel = isCheckingPermissions
    ? mc.dashboard.stills.checkingPermissions
    : isPermissionCheckGranted
      ? mc.dashboard.stills.permissionsGranted
      : mc.dashboard.settingsActions.checkPermissions
  const skillStatusMessage = toDisplayText(skillMessage)
    || (wizardClaudeCoworkGuideVisible ? toDisplayText(claudeCoworkGuideMessage) : '')
  const canAdvance = isWizardStepComplete(wizardStep)
  const selectedSet = new Set(selectedHarnesses)
  const pathInstallText = Object.entries(skillInstallPaths || {})
    .filter(([, path]) => typeof path === 'string' && path.length > 0)
    .map(([harness, path]) => `${harness}: ${path}`)
    .join('\n')
  const displayedSkillStatus = skillStatusMessage || toDisplayText(wizardMessage)

  const wizardStepLabel = (step) => ({
    1: toDisplayText(html.wizardStepContext) || 'Context',
    2: toDisplayText(html.wizardStepPermissions) || 'Permissions',
    3: toDisplayText(html.wizardStepInstallSkill) || 'Skills',
    4: toDisplayText(html.wizardStepComplete) || 'Complete'
  }[step] || '')

  const wizardClaudeCoworkGuideSteps = [
    toDisplayText(html.wizardClaudeCoworkGuideStep1) || 'Open Settings from the top left corner (or press: ⌘ + , ).',
    toDisplayText(html.wizardClaudeCoworkGuideStep2) || 'Go to Capabilities.',
    toDisplayText(html.wizardClaudeCoworkGuideStep3) || 'Toggle on Allow network egress.',
    toDisplayText(html.wizardClaudeCoworkGuideStep4) || 'Go back to the Cowork landing page (chat view).',
    toDisplayText(html.wizardClaudeCoworkGuideStep5) || 'Click plus sign (+) -> Plugins -> Add Plugin.',
    toDisplayText(html.wizardClaudeCoworkGuideStep6) || 'Go to Personal tab.',
    toDisplayText(html.wizardClaudeCoworkGuideStep7) || 'Click plus sign (+) -> Add marketplace from GitHub.',
    toDisplayText(html.wizardClaudeCoworkGuideStep8)
      || 'Paste https://github.com/familiar-software/familiar-claude-cowork-skill.',
    toDisplayText(html.wizardClaudeCoworkGuideStep9) || 'Click Sync.',
    toDisplayText(html.wizardClaudeCoworkGuideStep10) || 'Open the added marketplace and install the Familiar skill.',
    toDisplayText(html.wizardClaudeCoworkGuideStep11)
      || 'Go back to the Cowork landing page and choose a work folder that contains Familiar context.',
    toDisplayText(html.wizardClaudeCoworkGuideStep12) || 'Start a new Cowork session and invoke /familiar ....'
  ]

  const wizardFaq = [
    {
      question: toDisplayText(html.wizardFaqQuestionSensitiveData) || 'Will it capture passwords or embarrassing searches?',
      answer: toDisplayText(html.wizardFaqAnswerSensitiveData)
        || 'No.',
    },
    {
      question: toDisplayText(html.wizardFaqQuestionLeavesComputer) || 'Does anything leave my computer?',
      answer: toDisplayText(html.wizardFaqAnswerLeavesComputer)
        || 'You control your data. Familiar does NOT share any information.',
    },
    {
      question: toDisplayText(html.wizardFaqQuestionStorage) || 'How much space does it take?',
      answer: toDisplayText(html.wizardFaqAnswerStorage)
        || 'Overtime storage is kept small with cleanup.',
    },
    {
      question: toDisplayText(html.wizardFaqQuestionPerformance) || 'Will it slow down my Mac or battery?',
      answer: toDisplayText(html.wizardFaqAnswerPerformance)
        || 'There is some overhead, but not usually noticeable.',
    },
    {
      question: toDisplayText(html.wizardFaqQuestionPauseIdle) || 'Can I pause it / does it stop when I’m idle?',
      answer: toDisplayText(html.wizardFaqAnswerPauseIdle)
        || 'You can pause capture manually, and capture is active-aware.',
    },
    {
      question: toDisplayText(html.wizardFaqQuestionAudio) || 'Does it record meetings/audio?',
      answer: toDisplayText(html.wizardFaqAnswerAudio)
        || 'No.',
    },
    {
      question: toDisplayText(html.wizardFaqQuestionScreenshotFrequency) || 'How often does Familiar take a screenshot?',
      answer: toDisplayText(html.wizardFaqAnswerScreenshotFrequency)
        || 'Low Power mode: 15s, otherwise 5s.',
    },
  ]

  const getCircleClassName = (step) => {
    if (wizardStep === step) {
      return 'border-indigo-600 text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
    }
    if (wizardStep > step) {
      return 'border-indigo-600 bg-indigo-600 text-white'
    }
    return 'border-zinc-200 dark:border-zinc-700 text-zinc-500'
  }

  const getStepLabelClassName = (step) => {
    if (wizardStep === step) {
      return 'text-zinc-900 dark:text-zinc-100 font-semibold'
    }
    if (wizardStep > step) {
      return 'text-indigo-600 dark:text-indigo-400'
    }
    return 'text-zinc-500 dark:text-zinc-400'
  }

  const getLabel = (value, fallback) => toDisplayText(value) || fallback

  return (
      <section id="section-wizard" className="relative flex-1 flex flex-col min-h-0">
        <div className="flex-none px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center">
          <div className="w-full text-center">
            <CardTitle>
              {getLabel(html.wizardHeaderTitle, getLabel(wizardSection.title, 'Setup Wizard'))}
            </CardTitle>
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
              {getLabel(html.wizardHeaderSubtitle, 'Guided setup in four steps.')}
            </p>
          </div>
        </div>

      <div className="flex-none px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/40">
        <div className="flex items-center justify-between relative">
          <div className="flex flex-col items-center gap-1.5 relative z-10" data-wizard-step-indicator="1">
            <div
              className={`w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 text-[14px] font-semibold flex items-center justify-center ${getCircleClassName(1)}`}
              data-wizard-step-circle="1"
            >
              1
            </div>
            <span
              className={`text-[14px] font-medium ${getStepLabelClassName(1)}`}
              data-wizard-step-label="1"
            >
              {wizardStepLabel(1)}
            </span>
          </div>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 mx-2 relative">
            <div
              className="absolute inset-y-0 left-0 bg-indigo-600 transition-all"
              data-wizard-step-connector="1"
              style={{ width: wizardStep > 1 ? '100%' : '0%' }}
            />
          </div>

          <div className="flex flex-col items-center gap-1.5 relative z-10" data-wizard-step-indicator="2">
            <div
              className={`w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 text-[14px] font-semibold flex items-center justify-center ${getCircleClassName(2)}`}
              data-wizard-step-circle="2"
            >
              2
            </div>
            <span
              className={`text-[14px] font-medium ${getStepLabelClassName(2)}`}
              data-wizard-step-label="2"
            >
              {wizardStepLabel(2)}
            </span>
          </div>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 mx-2 relative">
            <div
              className="absolute inset-y-0 left-0 bg-indigo-600 transition-all"
              data-wizard-step-connector="2"
              style={{ width: wizardStep > 2 ? '100%' : '0%' }}
            />
          </div>

          <div className="flex flex-col items-center gap-1.5 relative z-10" data-wizard-step-indicator="3">
            <div
              className={`w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 text-[14px] font-semibold flex items-center justify-center ${getCircleClassName(3)}`}
              data-wizard-step-circle="3"
            >
              3
            </div>
            <span
              className={`text-[14px] font-medium ${getStepLabelClassName(3)}`}
              data-wizard-step-label="3"
            >
              {wizardStepLabel(3)}
            </span>
          </div>
          <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800 mx-2 relative">
            <div
              className="absolute inset-y-0 left-0 bg-indigo-600 transition-all"
              data-wizard-step-connector="3"
              style={{ width: wizardStep > 3 ? '100%' : '0%' }}
            />
          </div>

          <div className="flex flex-col items-center gap-1.5 relative z-10" data-wizard-step-indicator="4">
            <div
              className={`w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 text-[14px] font-semibold flex items-center justify-center ${getCircleClassName(4)}`}
              data-wizard-step-circle="4"
            >
              4
            </div>
            <span
              className={`text-[14px] font-medium ${getStepLabelClassName(4)}`}
              data-wizard-step-label="4"
            >
              {wizardStepLabel(4)}
            </span>
          </div>
        </div>
      </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 scrollbar-slim">
          <div className="max-w-[360px] mx-auto space-y-5" data-wizard-step="1" hidden={wizardStep !== 1}>
          <div className="text-center space-y-1">
            <CardTitle>
              {getLabel(html.wizardChooseContextFolderTitle, 'Choose your context folder')}
            </CardTitle>
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
              {getLabel(
                html.wizardChooseContextFolderDescription,
                'Familiar stores everything inside <Context Folder>/familiar/.'
              )}
            </p>
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
              <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                {getLabel(html.wizardChooseContextFolderBestPracticesLabel, 'Best Practices:')}
              </span>
              {' '}
              {getLabel(
                html.wizardChooseContextFolderBestPractices,
                'Use the same folder with which you usually work with agents.'
              )}
            </p>
          </div>
          <section className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="wizard-context-folder-path" className="section-label">
                {getLabel(html.wizardContextFolder, 'Context Folder')}
              </Label>
            </div>
            <div className="input-ring flex items-center gap-2 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-10Z" />
                </svg>
              </div>
              <Input
                id="wizard-context-folder-path"
                data-setting="context-folder-path"
                type="text"
                placeholder={getLabel(html.wizardContextFolderPlaceholderNoFolderSelected, 'No folder selected')}
                readOnly
                value={wizardContextFolderPath || displayedContextFolderPath || mc.general?.unknown}
                className="flex-1 bg-transparent text-[14px] font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none"
              />
              <Button
                id="wizard-context-folder-choose"
                data-action="context-folder-choose"
                type="button"
                variant="outline"
                size="sm"
                className="px-2.5 py-1.5 text-[14px] font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  void pickContextFolder(false)
                }}
              >
                {getLabel(html.wizardContextFolderChange, mc.dashboard.settingsActions.pickFolder)}
              </Button>
            </div>
            <p
              id="wizard-context-folder-error"
              data-setting-error="context-folder-error"
              className={`text-[14px] text-red-600 dark:text-red-400 ${toDisplayText(storageError) ? '' : 'hidden'}`}
              role="alert"
              aria-live="polite"
            >
              {toDisplayText(storageError)}
            </p>
          </section>
        </div>

        <div className="max-w-[360px] mx-auto space-y-5" data-wizard-step="2" hidden={wizardStep !== 2}>
          <div className="text-center space-y-1">
            <CardTitle>
              {getLabel(html.wizardEnableCapturingTitle, 'Enable Capturing')}
            </CardTitle>
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
              {getLabel(
                html.wizardEnableCapturingDescription,
                'Captures a still while you are active, and stops when idle. Requires Screen Recording permission.'
              )}
            </p>
          </div>
          <div data-component-source="permissions" className="space-y-5">
            <section className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  id="wizard-check-permissions"
                  data-action="check-permissions"
                  type="button"
                  variant="outline"
                  className="px-3 py-2 text-[14px] font-semibold bg-transparent border border-indigo-600 hover:border-indigo-700 rounded-lg text-indigo-600 hover:text-indigo-700 focus:outline-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    void checkPermissions()
                  }}
                  disabled={isCheckingPermissions}
                >
                  {checkPermissionsLabel}
                </Button>
                <Button
                  id="wizard-open-screen-recording-settings"
                  data-action="open-screen-recording-settings"
                  type="button"
                  variant="outline"
                  className="px-3 py-2 text-[14px] font-semibold bg-white dark:bg-zinc-800 border border-indigo-300 dark:border-indigo-700 rounded-lg text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none transition-colors cursor-pointer hidden"
                  onClick={openScreenRecordingSettings}
                  hidden={!isPermissionCheckDenied}
                >
                  {openScreenRecordingLabel}
                </Button>
              </div>
            </section>
            <p
              id="wizard-open-screen-recording-settings-note"
              data-open-screen-recording-settings-note
              className={`text-[14px] font-semibold text-zinc-500 dark:text-zinc-400 ${isPermissionCheckDenied ? '' : 'hidden'}`}
            >
              {getLabel(
                html.wizardAfterEnablingRestartFamiliar,
                'Enable access to capture while active in Screen Recording settings.'
              )}
            </p>
            <section
              id="wizard-recording-toggle-section"
              data-role="permission-recording-toggle-section"
              data-permission-toggle-visibility="hidden"
              className="hidden"
              hidden
              aria-hidden="true"
            />
            <p
              id="wizard-always-record-when-active-error"
              data-setting-error="always-record-when-active-error"
              className={`text-[14px] text-red-600 dark:text-red-400 ${toDisplayText(wizardError) ? '' : 'hidden'}`}
              role="alert"
              aria-live="polite"
            >
              {toDisplayText(wizardError)}
            </p>
            <span
              id="wizard-always-record-when-active-status"
              data-setting-status="always-record-when-active-status"
              className={`text-[14px] text-emerald-600 dark:text-emerald-400 ${toDisplayText(wizardMessage) ? '' : 'hidden'}`}
              aria-live="polite"
            >
              {toDisplayText(wizardMessage)}
            </span>
          </div>
        </div>

        <div className="max-w-[360px] mx-auto space-y-5" data-wizard-step="3" hidden={wizardStep !== 3}>
          <div className="text-center space-y-1">
            <CardTitle>
              {getLabel(html.wizardInstallSkillTitle, getLabel(wizardSkill.title, 'Set up Familiar in your tools'))}
            </CardTitle>
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
              {getLabel(html.wizardInstallSkillDescription, 'Pick where Familiar should be available.')}
            </p>
          </div>
          <div data-component-source="install-skill" className="space-y-5">
            <section className="space-y-2">
              <div className="skill-picker-options">
                {wizardHarnessOptions.map((entry) => (
                  <Label key={entry.value} className="skill-picker-option">
                    <span className="skill-picker-option-card">
                      <Checkbox
                        type="checkbox"
                        name="wizard-skill-harness"
                        value={entry.value}
                        data-skill-harness
                        checked={selectedSet.has(entry.value)}
                        onChange={handleHarnessChange}
                      />
                      <span className="skill-picker-icon" aria-hidden="true">
                        <img
                          src={
                            entry.value === 'claude' || entry.value === 'cloud-cowork'
                              ? './assets/skill-icons/claude-code.svg'
                              : entry.value === 'codex'
                                ? './assets/skill-icons/codex.svg'
                                : entry.value === 'antigravity'
                                  ? './assets/skill-icons/antigravity.svg'
                                  : './assets/skill-icons/cursor.svg'
                          }
                          alt=""
                        />
                      </span>
                      <span className="skill-picker-label">
                        {entry.value === 'claude'
                          ? getLabel(html.wizardHarnessClaudeCode, entry.label)
                          : entry.value === 'cloud-cowork'
                            ? getLabel(html.wizardHarnessClaudeCowork, entry.label)
                            : entry.value === 'codex'
                              ? getLabel(html.wizardHarnessCodex, entry.label)
                              : entry.value === 'antigravity'
                                ? getLabel(html.wizardHarnessAntigravity, entry.label)
                                : getLabel(html.wizardHarnessCursor, entry.label)}
                      </span>
                    </span>
                    {entry.value === 'cursor' && (
                      <span
                        id="wizard-skill-cursor-restart-note"
                        data-skill-cursor-restart-note
                        className={`skill-picker-note ${selectedSet.has('cursor') ? '' : 'hidden'}`}
                      >
                        {toDisplayText(wizardSkillMessages.cursorRestartNote) || 'Restart Cursor for the skill to take effect.'}
                      </span>
                    )}
                  </Label>
                ))}
              </div>
            </section>

            <p
              id="wizard-skill-path"
              data-skill-install-path
              className={`text-[14px] text-zinc-500 dark:text-zinc-400 whitespace-pre-line ${pathInstallText ? '' : 'hidden'}`}
              aria-live="polite"
            >
              {pathInstallText}
            </p>
            <p
              id="wizard-skill-status"
              data-skill-install-status
              className={`text-[14px] text-emerald-600 dark:text-emerald-400 ${displayedSkillStatus ? '' : 'hidden'}`}
              aria-live="polite"
            >
              {displayedSkillStatus}
            </p>
            <p
              id="wizard-skill-error"
              data-skill-install-error
              className={`text-[14px] text-red-600 dark:text-red-400 ${toDisplayText(skillError) ? '' : 'hidden'}`}
              role="alert"
              aria-live="polite"
            >
              {toDisplayText(skillError)}
            </p>

            <div
              id="wizard-cloud-cowork-guide"
              data-cloud-cowork-guide
              className={`react-install-guide-overlay ${wizardClaudeCoworkGuideVisible ? '' : 'react-hidden'}`}
              role="dialog"
              aria-modal="true"
              hidden={!wizardClaudeCoworkGuideVisible}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            >
              <div className="w-full max-w-[520px] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3 shadow-lg">
                <div className="space-y-1">
                  <CardTitle>
                    {getLabel(
                      html.wizardClaudeCoworkGuideTitle,
                      getLabel(wizardSkill.title, 'Claude Cowork install guide')
                    )}
                  </CardTitle>
                  <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
                    {getLabel(html.wizardClaudeCoworkGuideSubtitle, 'Use marketplace installation in Cowork.')}
                  </p>
                </div>
                <ol className="text-[14px] text-zinc-600 dark:text-zinc-300 space-y-1 list-decimal pl-4">
                  {wizardClaudeCoworkGuideSteps.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ol>
                <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
                  {CLOUD_COWORK_GUIDE_URL}
                </p>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                    id="wizard-cloud-cowork-copy-link"
                    data-action="cloud-cowork-copy-link"
                    type="button"
                    variant="outline"
                    className="px-3 py-1.5 text-[14px] font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                    onClick={() => {
                      void copyClaudeCoworkGuideLink()
                    }}
                  >
                    {getLabel(html.wizardClaudeCoworkGuideCopyLink, 'Copy Link')}
                  </Button>
                  <Button
                    id="wizard-cloud-cowork-done"
                    data-action="cloud-cowork-guide-done"
                    type="button"
                    variant="outline"
                    className="px-3 py-1.5 text-[14px] font-semibold bg-indigo-600 hover:bg-indigo-700 border border-indigo-600 hover:border-indigo-700 rounded-md text-white transition-colors cursor-pointer"
                    onClick={hideClaudeCoworkGuide}
                  >
                    {getLabel(html.wizardClaudeCoworkGuideDone, 'Done')}
                  </Button>
                </div>
                <p
                  id="wizard-cloud-cowork-guide-status"
                  data-cloud-cowork-guide-status
                  className={`text-[14px] text-emerald-600 dark:text-emerald-400 ${toDisplayText(claudeCoworkGuideMessage) ? '' : 'hidden'}`}
                  aria-live="polite"
                >
                  {toDisplayText(claudeCoworkGuideMessage)}
                </p>
                <p
                  id="wizard-cloud-cowork-guide-error"
                  data-cloud-cowork-guide-error
                  className={`text-[14px] text-red-600 dark:text-red-400 ${toDisplayText(claudeCoworkGuideError) ? '' : 'hidden'}`}
                  role="alert"
                  aria-live="polite"
                >
                  {toDisplayText(claudeCoworkGuideError)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[360px] mx-auto space-y-5" data-wizard-step="4" hidden={wizardStep !== 4}>
          <div className="text-center space-y-2">
            <CardTitle>
              {getLabel(html.wizardAllSetTitle, "You're all set")}
            </CardTitle>
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
              {getLabel(
                html.wizardAllSetDescription,
                'Your context folder and capturing preferences are configured, and the skill install completed.'
              )}
            </p>
          </div>
          <section className="space-y-2">
            <CardTitle>
              {getLabel(html.wizardFaqTitle, 'FAQ')}
            </CardTitle>
            <p className="text-[14px] text-zinc-400 dark:text-zinc-500 text-center">
              {getLabel(html.wizardFaqScrollHint, 'Scroll down to see all FAQs')}
            </p>
            <Accordion type="single" collapsible className="space-y-2">
              {wizardFaq.map((entry, index) => (
                <AccordionItem
                  key={entry.question}
                  value={`faq-${index}`}
                  className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2"
                >
                  <AccordionTrigger className="text-[14px] font-medium text-zinc-900 dark:text-zinc-100">
                    {entry.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-[14px] text-zinc-600 dark:text-zinc-300">
                    {entry.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
      </div>

      <div className="flex-none h-14 px-6 py-4 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/40">
        <Button
          id="wizard-back"
          type="button"
          variant="secondary"
          className="flex items-center gap-1.5 px-3 py-1.5 text-[14px] font-medium"
          onClick={goWizardBack}
          disabled={wizardStep <= 1}
        >
          {getLabel(html.wizardBack, 'Back')}
        </Button>
        <div className="flex items-center gap-2">
          <span
            id="wizard-step-status"
            className={`text-[14px] text-zinc-400 whitespace-nowrap ${canAdvance ? 'hidden' : ''}`}
            aria-live="polite"
          >
            {getLabel(mc.dashboard.wizard?.completeStepToContinue, 'Complete this step to continue.')}
          </span>
          <Button
            id="wizard-next"
            type="button"
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-[14px] font-medium text-white shadow-sm shadow-indigo-200 dark:shadow-none hover:shadow-md hover:shadow-indigo-500/20 active:translate-y-px transition-all ${wizardStep >= 4 ? 'hidden' : ''}`}
            onClick={goWizardNext}
            disabled={wizardStep >= 4 || !canAdvance}
            hidden={wizardStep >= 4}
          >
            {getLabel(html.wizardNext, 'Next')}
          </Button>
          <Button
            id="wizard-done"
            type="button"
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-[14px] font-medium text-white shadow-sm shadow-indigo-200 dark:shadow-none hover:shadow-md hover:shadow-indigo-500/20 active:translate-y-px transition-all ${wizardStep >= 4 ? '' : 'hidden'}`}
            onClick={completeWizard}
            disabled={wizardStep < 4 || !canAdvance}
            hidden={wizardStep < 4}
          >
            {getLabel(mc.actions?.wizardDone, 'Done')}
          </Button>
        </div>
      </div>
    </section>
  )
}
