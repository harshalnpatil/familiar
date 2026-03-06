import React from 'react'

import { Button } from '../ui/button'
import { ButtonGroup } from '../ui/button-group'
import { Input } from '../ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Select } from '../ui/select'
import { Label } from '../ui/label'
import { Checkbox } from '../ui/checkbox'
import { resolveRecordingIndicatorVisuals } from '../dashboard/dashboardUtils'

const LLM_PROVIDER_OPTIONS = [
  { value: '', label: 'Select provider...' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' }
]

const PROCESSOR_OPTIONS = [
  { value: 'apple_vision_ocr', label: 'Apple Vision OCR (local)' },
  { value: 'llm', label: 'LLM (cloud extraction)' }
]

export function RecordingSection({
  mc,
  toDisplayText,
  recordingStatus,
  recordingIndicator: providedRecordingIndicator,
  settings,
  recordingMessage,
  recordingError,
  setAlwaysRecord,
  checkPermissions,
  openScreenRecordingSettings,
  persistProvider,
  saveLlmApiKey,
  persistExtractor,
  copyDebugLog,
  pendingApiKey,
  setPendingApiKey,
  copyLogMessage,
  copyLogError,
  permissionCheckState,
  copyLogBusy
}) {
  const isCloudMode = settings.stillsMarkdownExtractorType === 'llm'
  const isPermissionCheckGranted = permissionCheckState === 'granted'
  const isPermissionCheckDenied = permissionCheckState === 'denied'
  const isCheckingPermissions = permissionCheckState === 'checking'
  const checkPermissionsLabel = isCheckingPermissions
    ? mc.dashboard.stills.checkingPermissions
    : isPermissionCheckGranted
      ? mc.dashboard.stills.permissionsGranted
      : mc.dashboard.settingsActions.checkPermissions
  const openScreenRecordingLabel = 'Enable Familiar In Screen Recording'
  const isPathSet = Boolean(settings.contextFolderPath)
  const checkPermissionsClasses = isPermissionCheckGranted
    ? 'text-emerald-600 hover:text-emerald-700 border-emerald-600 hover:border-emerald-700'
    : 'text-indigo-600 hover:text-indigo-700 border-indigo-600 hover:border-indigo-700'

  const recordingIndicator = providedRecordingIndicator || resolveRecordingIndicatorVisuals({
    enabled: recordingStatus?.enabled,
    state: recordingStatus?.state,
    manualPaused: recordingStatus?.manualPaused,
    permissionGranted: recordingStatus?.permissionGranted,
    permissionStatus: recordingStatus?.permissionStatus,
    copy: mc?.dashboard?.recordingIndicator || {}
  })
  const recordingStatusText = toDisplayText(recordingIndicator.label) || 'Off'
  const recordingDotClass = recordingIndicator.dotClass || 'bg-zinc-400'
  const recordingIndicatorStatus = recordingIndicator.status || 'off'
  const statusBadgeStyleMap = {
    off: 'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200',
    paused: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300',
    'permission-needed': 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300',
    recording: 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300',
    idle: 'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200'
  }
  const statusBadgeClasses =
    statusBadgeStyleMap[recordingIndicatorStatus] ||
    statusBadgeStyleMap.off

  return (
    <section id="section-recording" className="space-y-6">
      <section
        id="recording-recording-toggle-section"
        data-role="permission-recording-toggle-section"
        data-permission-toggle-visibility="always"
        className="space-y-2"
      >
        <Label htmlFor="recording-always-record-when-active" className="relative block w-full cursor-pointer group">
          <Checkbox
            id="recording-always-record-when-active"
            data-setting="always-record-when-active"
            type="checkbox"
            className="sr-only peer"
            checked={settings.alwaysRecordWhenActive}
            onChange={(event) => {
              void setAlwaysRecord(event.target.checked)
            }}
          />
          <div className="wizard-capture-toggle-card rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 p-4 transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 peer-checked:bg-indigo-50/40 dark:peer-checked:bg-indigo-500/10 peer-checked:shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="wizard-capture-toggle-icon w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-700 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 peer-checked:bg-indigo-100 dark:peer-checked:bg-indigo-900/50 peer-checked:border-transparent peer-checked:text-indigo-600 dark:peer-checked:text-indigo-400">
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <rect x="3" y="7" width="13" height="10" rx="2" />
                    <path d="M16 10l5-3v10l-5-3z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[14px] font-medium text-zinc-900 dark:text-zinc-100">Capture while active</span>
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[14px] font-medium uppercase tracking-wide ${statusBadgeClasses}`}
                      hidden={recordingIndicatorStatus !== 'paused'}
                    >
                      <span id="recording-status-dot" className={`w-2 h-2 rounded-full ${recordingDotClass}`} />
                      <span id="recording-status">{recordingStatusText}</span>
                    </div>
                  </div>
                  <span className="wizard-capture-toggle-subtitle-off text-[14px] text-zinc-500 dark:text-zinc-400 block peer-checked:hidden transition-opacity">
                    Action required to proceed.
                  </span>
                </div>
              </div>
              <div className="wizard-capture-toggle-switch relative w-12 h-6 rounded-full bg-zinc-300 dark:bg-zinc-700 transition-colors duration-300 ease-in-out peer-checked:bg-indigo-600 shadow-inner group-hover:bg-zinc-400 dark:group-hover:bg-zinc-600 peer-checked:group-hover:bg-indigo-700">
                <div className="wizard-capture-toggle-knob absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 peer-checked:translate-x-6" />
              </div>
            </div>
          </div>
        </Label>
        <p id="recording-always-record-when-active-error" data-setting-error="always-record-when-active-error" className={`text-[14px] text-red-600 dark:text-red-400 ${toDisplayText(recordingError) ? '' : 'hidden'}`}>
          {toDisplayText(recordingError)}
        </p>
        <span
          id="recording-always-record-when-active-status"
          data-setting-status="always-record-when-active-status"
          className={`text-[14px] text-emerald-600 dark:text-emerald-400 ${toDisplayText(recordingMessage) ? '' : 'hidden'}`}
          aria-live="polite"
        >
          {toDisplayText(recordingMessage)}
        </span>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Advanced</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <ButtonGroup>
                <Button
                  id="recording-check-permissions"
                  data-action="check-permissions"
                  variant="outline"
                  size="sm"
                  className={checkPermissionsClasses}
                  disabled={isCheckingPermissions}
                  onClick={() => {
                    void checkPermissions()
                  }}
                >
                  {checkPermissionsLabel}
                </Button>
                <Button
                  id="copy-debug-log"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void copyDebugLog()
                  }}
                  disabled={copyLogBusy}
                >
                  {mc.dashboard.settingsActions.copyLog}
                </Button>
              </ButtonGroup>
              <ButtonGroup hidden={!isPermissionCheckDenied}>
                <Button
                  id="recording-open-screen-recording-settings"
                  data-action="open-screen-recording-settings"
                  variant="outline"
                  size="sm"
                  onClick={openScreenRecordingSettings}
                >
                  {openScreenRecordingLabel}
                </Button>
              </ButtonGroup>
            </div>
            <p
              id="recording-open-screen-recording-settings-note"
              data-open-screen-recording-settings-note
              className="text-[14px] font-semibold text-zinc-500 dark:text-zinc-400"
              hidden={!isPermissionCheckDenied}
            >
              Enable access to capture while active in Screen Recording settings.
            </p>
            <span id="copy-log-status" data-setting-status="copy-log-status" className={`text-[14px] text-emerald-600 dark:text-emerald-400 ${toDisplayText(copyLogMessage) ? '' : 'hidden'}`} aria-live="polite">
              {toDisplayText(copyLogMessage)}
            </span>
            <span id="copy-log-error" data-setting-error="copy-log-error" className={`text-[14px] text-red-600 dark:text-red-400 ${toDisplayText(copyLogError) ? '' : 'hidden'}`} role="alert" aria-live="polite">
              {toDisplayText(copyLogError)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card data-processing-engine>
        <CardHeader>
          <CardTitle>Processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span id="stills-markdown-extractor-status" data-setting-status="stills-markdown-extractor-status" className={`text-[14px] text-emerald-600 dark:text-emerald-400 ${toDisplayText(recordingMessage) ? '' : 'hidden'}`} aria-live="polite">
              {toDisplayText(recordingMessage)}
            </span>
          </div>
          <p id="stills-markdown-extractor-error" data-setting-error="stills-markdown-extractor-error" className={`text-[14px] text-red-600 dark:text-red-400 ${toDisplayText(recordingError) ? '' : 'hidden'}`}>
            {toDisplayText(recordingError)}
          </p>
          <Select id="stills-markdown-extractor" data-setting="stills-markdown-extractor" className="hidden" value={settings.stillsMarkdownExtractorType}>
            {PROCESSOR_OPTIONS.map((entry) => (
              <option key={entry.value} value={entry.value}>
                {entry.label}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <Button
              type="button"
              data-processing-engine-mode="apple_vision_ocr"
              variant="ghost"
              className={`py-1.5 text-[14px] font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${isCloudMode ? 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}
              onClick={() => {
                void persistExtractor('apple_vision_ocr')
              }}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="6" y="11" width="12" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              Apple Vision OCR (local)
            </Button>
            <Button
              type="button"
              data-processing-engine-mode="llm"
              variant="ghost"
              className={`py-1.5 text-[14px] font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${isCloudMode ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
              onClick={() => {
                void persistExtractor('llm')
              }}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M20 17.5a4.5 4.5 0 0 0-3.2-4.3A6 6 0 0 0 5 14a3.5 3.5 0 0 0 .5 7H18a3 3 0 0 0 2-3.5Z" />
              </svg>
              LLM (cloud)
            </Button>
          </div>

          <div className={`space-y-3 pt-1 ${isCloudMode ? '' : 'hidden'}`} data-processing-engine-panel="llm">
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
              Use LLM OCR for richer markdown output.
            </p>
            <div className="space-y-2">
              <Label className="section-label">LLM provider</Label>
              <Select
                id="llm-provider"
                data-setting="llm-provider"
                className="input-ring w-full appearance-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-[14px] font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
                value={settings.llmProviderName}
                onChange={(event) => {
                  void persistProvider(event.target.value)
                }}
              >
                {LLM_PROVIDER_OPTIONS.map((entry) => (
                  <option key={entry.value} value={entry.value}>
                    {entry.label}
                  </option>
                ))}
              </Select>
              <p id="llm-provider-error" data-setting-error="llm-provider-error" className="text-[14px] text-red-600 dark:text-red-400 hidden">
                {toDisplayText(recordingError)}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="llm-api-key" className="section-label">LLM API key</Label>
              <div className="relative w-full">
                <svg viewBox="0 0 24 24" className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M14.5 10.5a3.5 3.5 0 1 0-7 0 3.5 3.5 0 0 0 7 0Z" />
                  <path d="M12 14v3m0 0h6m-6 0l2 2m-2-2l2-2" />
                </svg>
                <Input
                  id="llm-api-key"
                  data-setting="llm-api-key"
                  className="pl-8"
                  type="password"
                  value={pendingApiKey}
                  onChange={(event) => {
                    setPendingApiKey(event.target.value)
                  }}
                  onBlur={() => {
                    void saveLlmApiKey(pendingApiKey)
                  }}
                  placeholder={isPathSet ? 'Saved key' : 'Not set'}
                />
              </div>
              <p id="llm-api-key-error" data-setting-error="llm-api-key-error" className="text-[14px] text-red-600 dark:text-red-400 hidden">
                {toDisplayText(recordingError)}
              </p>
              <span id="llm-api-key-status" data-setting-status="llm-api-key-status" className={`text-[14px] text-emerald-600 dark:text-emerald-400 ${toDisplayText(recordingMessage) ? '' : 'hidden'}`} aria-live="polite">
                {toDisplayText(recordingMessage)}
              </span>
            </div>
          </div>

          <div className={`space-y-2 pt-1 ${isCloudMode ? 'hidden' : ''}`} data-processing-engine-panel="apple_vision_ocr">
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
              Local OCR runs on-device and keeps captures private.
            </p>
          </div>
        </CardContent>
      </Card>

    </section>
  )
}
