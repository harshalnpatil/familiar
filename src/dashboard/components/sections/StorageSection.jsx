import React from 'react'

const AUTO_CLEANUP_OPTIONS = [
  { value: '2', label: '2 days' },
  { value: '7', label: '7 days' }
]

const STORAGE_DELETE_PRESETS = [
  { value: '15m', label: '15 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
  { value: 'all', label: 'all time' }
]

export function StorageSection({
  mc,
  displayedContextFolderPath,
  settings,
  storageUsage,
  storageUsageLoaded,
  storageMessage,
  storageError,
  storageDeleteMessage,
  storageDeleteError,
  deleteBusy,
  deleteWindow,
  setDeleteWindow,
  pickContextFolder,
  openCurrentContextFolder,
  saveStorageRetention,
  isContextFolderMoveInProgress,
  isDeleteControlsDisabled,
  deleteRecentFiles,
  formatBytes,
  toDisplayText
}) {
  const isPickerDisabled = Boolean(isContextFolderMoveInProgress)
  const isDeleteDisabled = Boolean(isDeleteControlsDisabled || deleteBusy)
  const moveFolderLabel = toDisplayText(mc?.settingsActions?.moveFolder) || 'Change Folder'
  const isStorageUsageLoaded = Boolean(storageUsageLoaded)
  const contextFolderTitle = settings.contextFolderPath
    ? `${settings.contextFolderPath}/familiar`
    : ''
  const storagePathValue = displayedContextFolderPath || ''
  const storageUsageStatusText = toDisplayText(storageMessage)
  const storageDeleteStatusText = toDisplayText(storageDeleteMessage)
  const storageDeleteErrorText = toDisplayText(storageDeleteError)
  const contextFolderErrorText = toDisplayText(storageError)

  const shouldOpenCurrentFolder = (event) => {
    if (!event || isPickerDisabled) {
      return false
    }
    const target = event.target
    if (!target || typeof target.closest !== 'function') {
      return true
    }
    if (target.closest('[data-action="storage-open-folder"]')) {
      return false
    }
    return true
  }

  const handleStoragePickerActivation = (event) => {
    if (isPickerDisabled) {
      return
    }
    if (!shouldOpenCurrentFolder(event)) {
      return
    }
    void openCurrentContextFolder()
  }

  const storageUsageErrorText = toDisplayText(storageError)

  return (
    <section id="section-storage" className="space-y-4 max-w-[520px] flex flex-col flex-1">
      <section className="space-y-2">
        <div className="flex items-center">
          <label htmlFor="context-folder-path" className="section-label">
            Context Folder
          </label>
        </div>
        <div
          id="context-folder-picker-surface"
          data-action="context-folder-picker-surface"
          role="button"
          tabIndex={isPickerDisabled ? -1 : 0}
          title={contextFolderTitle}
          className="input-ring flex items-center gap-2 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg cursor-pointer focus:outline-none"
          onClick={handleStoragePickerActivation}
          onKeyDown={(event) => {
            if (isPickerDisabled) {
              return
            }
            if (event.key !== 'Enter' && event.key !== ' ') {
              return
            }
            event.preventDefault()
            handleStoragePickerActivation(event)
          }}
        >
          <div
            className="flex items-center justify-center w-6 h-6 rounded-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-10Z" />
            </svg>
          </div>
          <input
            id="context-folder-path"
            data-setting="context-folder-path"
            type="text"
            placeholder="No folder selected"
            readOnly
            value={storagePathValue}
            className="flex-1 min-w-0 bg-transparent text-xs font-medium text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none truncate cursor-pointer"
          />
          <button
            id="recording-move-folder"
            type="button"
            data-action="storage-open-folder"
            title=""
            className="px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isPickerDisabled}
            onClick={(event) => {
              event.stopPropagation()
              void pickContextFolder(true)
            }}
          >
            {moveFolderLabel}
          </button>
        </div>
        <span
          id="context-folder-status"
          data-setting-status="context-folder-status"
          className={`text-xs text-emerald-600 dark:text-emerald-400 ${storageUsageStatusText ? '' : 'hidden'}`}
          aria-live="polite"
        >
          {storageUsageStatusText}
        </span>
        <p
          id="context-folder-error"
          data-setting-error="context-folder-error"
          className={`text-xs text-red-600 dark:text-red-400 ${contextFolderErrorText ? '' : 'hidden'}`}
          role="alert"
          aria-live="polite"
        >
          {contextFolderErrorText}
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="section-label">
            <span>Usage Breakdown</span>
            <span
              id="storage-usage-computing-tag"
              className={`text-[11px] text-zinc-400 ${isStorageUsageLoaded ? 'hidden' : ''}`}
            >
              (Computing)
            </span>
          </h3>
          <div
            id="storage-usage-loading-indicator"
            className={`items-center gap-1.5 text-zinc-400 ${isStorageUsageLoaded ? 'hidden' : ''}`}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-3.5 h-3.5 animate-spin"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M12 3a9 9 0 1 0 9 9" />
            </svg>
            <span className="text-xs">Calculating...</span>
          </div>
        </div>

        <div
          id="storage-usage-loading"
          className={`space-y-2 ${isStorageUsageLoaded ? 'hidden' : ''}`}
        >
          <div className="h-2.5 w-52 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
          <div className="h-2.5 w-48 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
        </div>

        <div id="storage-usage-loaded" className={`space-y-1 ${isStorageUsageLoaded ? '' : 'hidden'}`}>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Text files using</span>
            {' '}
            <span id="storage-usage-value-steels-markdown" className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {formatBytes(storageUsage.steelsMarkdownBytes)}
            </span>
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Screenshots using</span>
            {' '}
            <span id="storage-usage-value-screenshots" className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
              {formatBytes(storageUsage.screenshotsBytes)}
            </span>
          </p>
        </div>
        <p
          id="storage-usage-error"
          data-setting-error="storage-usage-error"
          className={`text-xs text-red-600 dark:text-red-400 ${storageUsageErrorText ? '' : 'hidden'}`}
          role="alert"
          aria-live="polite"
        >
          {storageUsageErrorText}
        </p>
      </section>

      <div className="space-y-2">
        <h3 className="section-label">Images retention</h3>
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="p-4 space-y-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Deletes screenshots automatically to save space (markdown files are NOT deleted)
            </p>
            <div className="relative w-fit">
              <select
                id="storage-auto-cleanup-retention-days"
                data-setting="storage-auto-cleanup-retention-days"
                className="appearance-none bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-md py-2 pl-3 pr-8 outline-none focus:ring-2 focus:ring-zinc-400/20 cursor-pointer transition-all"
                value={String(settings.storageAutoCleanupRetentionDays)}
                onChange={(event) => {
                  void saveStorageRetention(event.target.value)
                }}
              >
                {AUTO_CLEANUP_OPTIONS.map((entry) => (
                  <option key={entry.value} value={entry.value}>
                    {entry.label}
                  </option>
                ))}
              </select>
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="section-label">Delete recent files</h3>
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
          <div className="p-4 space-y-3">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Oops, forgot to turn off recording?</p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <select
                  id="storage-delete-window"
                  data-setting="storage-delete-window"
                  className="appearance-none bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium rounded-md py-2 pl-3 pr-8 outline-none focus:ring-2 focus:ring-zinc-400/20 cursor-pointer transition-all"
                  value={deleteWindow}
                  onChange={(event) => {
                    setDeleteWindow(event.target.value)
                  }}
                  disabled={isDeleteDisabled}
                >
                  {STORAGE_DELETE_PRESETS.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
                <svg
                  viewBox="0 0 24 24"
                  className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
              <button
                id="storage-delete-files"
                data-action="storage-delete-files"
                type="button"
                className="px-3 py-2 text-[11px] font-medium border border-zinc-200 dark:border-zinc-700 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800 focus:outline-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => {
                  void deleteRecentFiles()
                }}
                disabled={isDeleteDisabled}
              >
                Delete files
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <span
          id="storage-delete-files-status"
          data-setting-status="storage-delete-files-status"
          className={`text-xs text-emerald-600 dark:text-emerald-400 ${storageDeleteStatusText ? '' : 'hidden'}`}
          aria-live="polite"
        >
          {storageDeleteStatusText}
        </span>
      </div>
      {storageDeleteError ? (
        <p
          id="storage-delete-files-error"
          data-setting-error="storage-delete-files-error"
          className={`text-xs text-red-600 dark:text-red-400 ${storageDeleteErrorText ? '' : 'hidden'}`}
          role="alert"
          aria-live="polite"
        >
          {storageDeleteErrorText}
        </p>
      ) : null}
    </section>
  )
}
