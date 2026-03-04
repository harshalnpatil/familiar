import React from 'react'
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
        <label htmlFor="recording-always-record-when-active" className="relative block w-full cursor-pointer group">
          <input
            id="recording-always-record-when-active"
            data-setting="always-record-when-active"
            type="checkbox"
            className="sr-only peer"
            checked={settings.alwaysRecordWhenActive}
            onChange={(event) => {
              void setAlwaysRecord(event.target.checked)
            }}
          />
          <div className="wizard-capture-toggle-card rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900 p-4 transition-all duration-300 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 peer-checked:border-indigo-500 peer-checked:bg-indigo-50/40 dark:peer-checked:border-indigo-500/50 dark:peer-checked:bg-indigo-500/10 peer-checked:shadow-sm">
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
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Capture while active</span>
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${statusBadgeClasses}`}
                    >
                      <span id="recording-status-dot" className={`w-2 h-2 rounded-full ${recordingDotClass}`} />
                      <span id="recording-status">{recordingStatusText}</span>
                    </div>
                  </div>
                  <span className="wizard-capture-toggle-subtitle-off text-xs text-zinc-500 dark:text-zinc-400 block peer-checked:hidden transition-opacity">
                    Action required to proceed.
                  </span>
                  <span className="wizard-capture-toggle-subtitle-on text-xs text-indigo-600 dark:text-indigo-400 hidden peer-checked:block transition-opacity">
                    Capturing is enabled.
                  </span>
                </div>
              </div>
              <div className="wizard-capture-toggle-switch relative w-12 h-6 rounded-full bg-zinc-300 dark:bg-zinc-700 transition-colors duration-300 ease-in-out peer-checked:bg-indigo-600 shadow-inner group-hover:bg-zinc-400 dark:group-hover:bg-zinc-600 peer-checked:group-hover:bg-indigo-700">
                <div className="wizard-capture-toggle-knob absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 peer-checked:translate-x-6" />
              </div>
            </div>
          </div>
        </label>
        <p id="recording-always-record-when-active-error" data-setting-error="always-record-when-active-error" className={`text-xs text-red-600 dark:text-red-400 ${toDisplayText(recordingError) ? '' : 'hidden'}`}>
          {toDisplayText(recordingError)}
        </p>
        <span
          id="recording-always-record-when-active-status"
          data-setting-status="always-record-when-active-status"
          className={`text-xs text-emerald-600 dark:text-emerald-400 ${toDisplayText(recordingMessage) ? '' : 'hidden'}`}
          aria-live="polite"
        >
          {toDisplayText(recordingMessage)}
        </span>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="recording-check-permissions" className="section-label">
            Permissions
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="recording-check-permissions"
            data-action="check-permissions"
            className={`px-3 py-2 text-xs font-semibold bg-transparent border rounded-lg focus:outline-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${checkPermissionsClasses}`}
            type="button"
            onClick={() => {
              void checkPermissions()
            }}
            disabled={isCheckingPermissions}
          >
            {checkPermissionsLabel}
          </button>
          <button
            id="recording-open-screen-recording-settings"
            data-action="open-screen-recording-settings"
            className={`px-3 py-2 text-xs font-semibold bg-white dark:bg-zinc-800 border border-indigo-300 dark:border-indigo-700 rounded-lg text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none transition-colors cursor-pointer ${isPermissionCheckDenied ? '' : 'hidden'}`}
            type="button"
            onClick={openScreenRecordingSettings}
          >
            {openScreenRecordingLabel}
          </button>
        </div>
        <p id="recording-open-screen-recording-settings-note" data-open-screen-recording-settings-note className={`text-xs font-semibold text-zinc-500 dark:text-zinc-400 ${isPermissionCheckDenied ? '' : 'hidden'}`}>
          Enable access to capture while active in Screen Recording settings.
        </p>
      </section>

      <section className="space-y-2" data-processing-engine>
        <div className="space-y-1">
          <h3 className="section-label">Processing</h3>
        </div>
        <div className="flex items-center justify-between">
          <span id="stills-markdown-extractor-status" data-setting-status="stills-markdown-extractor-status" className={`text-xs text-emerald-600 dark:text-emerald-400 ${toDisplayText(recordingMessage) ? '' : 'hidden'}`} aria-live="polite">
            {toDisplayText(recordingMessage)}
          </span>
        </div>
        <p id="stills-markdown-extractor-error" data-setting-error="stills-markdown-extractor-error" className={`text-xs text-red-600 dark:text-red-400 ${toDisplayText(recordingError) ? '' : 'hidden'}`}>
          {toDisplayText(recordingError)}
        </p>
        <select id="stills-markdown-extractor" data-setting="stills-markdown-extractor" className="hidden" value={settings.stillsMarkdownExtractorType}>
          {PROCESSOR_OPTIONS.map((entry) => (
            <option key={entry.value} value={entry.value}>
              {entry.label}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            data-processing-engine-mode="apple_vision_ocr"
            className={`py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${isCloudMode ? 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}
            onClick={() => {
              void persistExtractor('apple_vision_ocr')
            }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="6" y="11" width="12" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            Apple Vision OCR (local)
          </button>
          <button
            type="button"
            data-processing-engine-mode="llm"
            className={`py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${isCloudMode ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            onClick={() => {
              void persistExtractor('llm')
            }}
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M20 17.5a4.5 4.5 0 0 0-3.2-4.3A6 6 0 0 0 5 14a3.5 3.5 0 0 0 .5 7H18a3 3 0 0 0 2-3.5Z" />
            </svg>
            LLM (cloud)
          </button>
        </div>

        <div className={`space-y-3 pt-1 ${isCloudMode ? '' : 'hidden'}`} data-processing-engine-panel="llm">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Use LLM OCR for richer markdown output.
          </p>
          <div className="space-y-2">
            <label className="section-label">LLM provider</label>
            <select
              id="llm-provider"
              data-setting="llm-provider"
              className="input-ring w-full appearance-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer"
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
            </select>
            <p id="llm-provider-error" data-setting-error="llm-provider-error" className="text-xs text-red-600 dark:text-red-400 hidden">
              {toDisplayText(recordingError)}
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="llm-api-key" className="section-label">LLM API key</label>
            <div className="relative w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <svg viewBox="0 0 24 24" className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M14.5 10.5a3.5 3.5 0 1 0-7 0 3.5 3.5 0 0 0 7 0Z" />
                <path d="M12 14v3m0 0h6m-6 0l2 2m-2-2l2-2" />
              </svg>
              <input
                id="llm-api-key"
                data-setting="llm-api-key"
                className="w-full bg-transparent text-xs text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none py-2 pl-8 pr-3"
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
            <p id="llm-api-key-error" data-setting-error="llm-api-key-error" className="text-xs text-red-600 dark:text-red-400 hidden">
              {toDisplayText(recordingError)}
            </p>
            <span id="llm-api-key-status" data-setting-status="llm-api-key-status" className={`text-xs text-emerald-600 dark:text-emerald-400 ${toDisplayText(recordingMessage) ? '' : 'hidden'}`} aria-live="polite">
              {toDisplayText(recordingMessage)}
            </span>
          </div>
        </div>

        <div className={`space-y-2 pt-1 ${isCloudMode ? 'hidden' : ''}`} data-processing-engine-panel="apple_vision_ocr">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Local OCR runs on-device and keeps captures private.
          </p>
        </div>
      </section>

      <div className="w-full border-t border-zinc-200 dark:border-zinc-800 flex flex-col items-start gap-1 mt-auto pt-4">
        <button
          id="copy-debug-log"
          className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          type="button"
          onClick={() => {
            void copyDebugLog()
          }}
          disabled={copyLogBusy}
        >
          {mc.dashboard.settingsActions.copyLog}
        </button>
        <span id="copy-log-status" data-setting-status="copy-log-status" className={`text-xs text-emerald-600 dark:text-emerald-400 ${toDisplayText(copyLogMessage) ? '' : 'hidden'}`} aria-live="polite">
          {toDisplayText(copyLogMessage)}
        </span>
        <span id="copy-log-error" data-setting-error="copy-log-error" className={`text-xs text-red-600 dark:text-red-400 ${toDisplayText(copyLogError) ? '' : 'hidden'}`} role="alert" aria-live="polite">
          {toDisplayText(copyLogError)}
        </span>
      </div>
    </section>
  )
}
