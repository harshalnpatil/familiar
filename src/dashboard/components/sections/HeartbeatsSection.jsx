import React, { useMemo, useState } from 'react'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { ButtonGroup } from '../ui/button-group'
import { Card, CardFooter, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import { Checkbox } from '../ui/checkbox'
import { Textarea } from '../ui/textarea'

import {
  HEARTBEAT_DEFAULT_TIMEZONE,
  HEARTBEAT_FREQUENCIES,
  HEARTBEAT_RUNNERS,
  HEARTBEAT_WEEKDAYS
} from '../dashboard/dashboardConstants'

const toSafeItems = (value) => (Array.isArray(value) ? value : [])
const getLabel = (mc, entry = {}, fallback = '') => {
  if (entry && typeof entry.label === 'string' && entry.label.length > 0) {
    return entry.label
  }
  return fallback
}

const nowMinutes = () => {
  const now = new Date()
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  return `${hour}:${minute}`
}

const getSafeTime = (value) => {
  if (typeof value !== 'string') {
    return ''
  }
  const safe = value.trim()
  return /^\d{2}:\d{2}$/.test(safe) ? safe : ''
}

const getSafeTimezone = (value) => {
  const candidate = typeof value === 'string' ? value.trim() : ''
  return candidate.length > 0 ? candidate : HEARTBEAT_DEFAULT_TIMEZONE
}

const resolveRunnerLabel = (value) => {
  const normalized = typeof value === 'string' ? value.toLowerCase() : ''
  return normalized === 'claude-code' ? 'Claude Code' : 'Codex'
}

const resolveFrequencyLabel = (value) => (value === 'weekly' ? 'Weekly' : 'Daily')

const resolveDayLabel = (value, labelLookup) => {
  const parsed = Number.parseInt(value, 10)
  const match = labelLookup.find((entry) => Number.parseInt(entry.value, 10) === parsed)
  return match?.label || 'Monday'
}

const resolveLastRunText = (entry, toDisplayText) => {
  if (!entry) {
    return ''
  }
  if (!Number.isFinite(entry.lastRunAt)) {
    return toDisplayText('Never run')
  }
  const dateText = new Date(entry.lastRunAt).toLocaleString()
  if (entry.lastRunStatus === 'error') {
    return `Failed at ${dateText}`
  }
  if (entry.lastRunStatus === 'skipped') {
    return `Skipped at ${dateText}`
  }
  return `Last run at ${dateText}`
}

export function HeartbeatsSection({
  mc,
  toDisplayText,
  settings,
  heartbeats = [],
  heartbeatMessage,
  heartbeatError,
  saveHeartbeat,
  deleteHeartbeat,
  setHeartbeatEnabled,
  runHeartbeatNow,
  openHeartbeatsFolder,
  runningHeartbeatIds
}) {
  const timezoneOptions = useMemo(() => {
    const source = typeof Intl.supportedValuesOf === 'function'
      ? Intl.supportedValuesOf('timeZone')
      : []
    const fallbackZone = HEARTBEAT_DEFAULT_TIMEZONE
    const set = new Set(source)
    set.add(fallbackZone)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [])
  const weekdayLookup = useMemo(() => HEARTBEAT_WEEKDAYS, [])
  const runnerLookup = useMemo(() => HEARTBEAT_RUNNERS, [])
  const frequencyLookup = useMemo(() => HEARTBEAT_FREQUENCIES, [])
  const heartbeatItems = toSafeItems(heartbeats)
  const hasContextFolder = Boolean(settings?.contextFolderPath)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [formError, setFormError] = useState('')
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [draft, setDraft] = useState({
    topic: '',
    prompt: '',
    runner: runnerLookup[0]?.value || 'codex',
    frequency: frequencyLookup[0]?.value || 'daily',
    dayOfWeek: weekdayLookup[0]?.value || '1',
    time: nowMinutes(),
    timezone: getSafeTimezone(HEARTBEAT_DEFAULT_TIMEZONE),
    enabled: true
  })

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingId('')
    setFormError('')
    setIsFormSubmitting(false)
  }

  const openNewForm = () => {
    setDraft({
      topic: '',
      prompt: '',
      runner: runnerLookup[0]?.value || 'codex',
      frequency: frequencyLookup[0]?.value || 'daily',
      dayOfWeek: weekdayLookup[0]?.value || '1',
      time: nowMinutes(),
      timezone: getSafeTimezone(HEARTBEAT_DEFAULT_TIMEZONE),
      enabled: true
    })
    setIsFormOpen(true)
    setEditingId('')
    setFormError('')
    setIsFormSubmitting(false)
  }

  const openEditForm = (entry) => {
    setDraft({
      topic: entry.topic || '',
      prompt: entry.prompt || '',
      runner: entry.runner || runnerLookup[0]?.value || 'codex',
      frequency: entry.schedule?.frequency || frequencyLookup[0]?.value || 'daily',
      dayOfWeek: String(entry.schedule?.dayOfWeek || weekdayLookup[0]?.value || '1'),
      time: getSafeTime(entry.schedule?.time) || nowMinutes(),
      timezone: getSafeTimezone(entry.schedule?.timezone),
      enabled: entry.enabled !== false
    })
    setEditingId(entry.id || '')
    setIsFormOpen(true)
    setFormError('')
    setIsFormSubmitting(false)
  }

  const openDuplicateForm = (entry) => {
    openEditForm(entry)
    setDraft((previous) => ({
      ...previous,
      topic: `${previous.topic || 'heartbeat'}-copy`,
      enabled: true
    }))
    setEditingId('')
  }

  const save = async () => {
    if (typeof saveHeartbeat !== 'function') {
      setFormError(toDisplayText(mc?.dashboard?.heartbeats?.errors?.bridgeUnavailableRestart)
        || 'Unable to save heartbeat.')
      return
    }
    if (!draft.topic.trim()) {
      setFormError('Topic is required.')
      return
    }
    if (!draft.prompt.trim()) {
      setFormError('Prompt is required.')
      return
    }
    setIsFormSubmitting(true)
    setFormError('')

    const payload = {
      id: editingId,
      topic: draft.topic.trim(),
      prompt: draft.prompt.trim(),
      runner: draft.runner,
      frequency: draft.frequency,
      dayOfWeek: Number.parseInt(draft.dayOfWeek, 10),
      time: draft.time,
      timezone: draft.timezone,
      enabled: draft.enabled
    }
    const scheduleTime = getSafeTime(payload.time)
    const result = await saveHeartbeat({
      ...payload,
      time: scheduleTime || '09:00'
    })
    setIsFormSubmitting(false)
    if (!result || result.ok !== true) {
      setFormError(result?.message || 'Failed to save heartbeat.')
      return
    }
    closeForm()
  }

  const onDelete = async (id) => {
    if (!window?.confirm) {
      const next = await deleteHeartbeat?.(id)
      return next
    }
    if (!window.confirm('Delete this heartbeat?')) {
      return
    }
    void deleteHeartbeat?.(id)
  }

  const onRunNow = (id) => {
    if (!id || !hasContextFolder) {
      return
    }
    void runHeartbeatNow?.(id)
  }

  const onOpenFolder = () => {
    if (!hasContextFolder) {
      return
    }
    void openHeartbeatsFolder?.()
  }

  const isWeekly = draft.frequency === 'weekly'

  return (
    <section id="section-heartbeats" className="space-y-5 max-w-[680px]">
      <div className="flex items-start justify-end gap-3">
        <div className="flex gap-2">
          <Button
            id="heartbeats-open-folder"
            onClick={onOpenFolder}
            disabled={!hasContextFolder}
            variant="outline"
            size="sm"
            >
            Open Heartbeats Folder
          </Button>
          <Button
            id="heartbeats-add"
            variant="default"
            size="sm"
            onClick={openNewForm}
          >
            + Add Heartbeat
          </Button>
        </div>
      </div>

      <div className={`text-[14px] ${toDisplayText(heartbeatMessage) ? '' : 'hidden'}`}>
        <span className="text-emerald-600 dark:text-emerald-400">{toDisplayText(heartbeatMessage)}</span>
      </div>
      <p className={`text-[14px] text-red-600 dark:text-red-400 ${toDisplayText(heartbeatError) ? '' : 'hidden'}`}>
        {toDisplayText(heartbeatError)}
      </p>

      {heartbeatItems.length === 0 ? (
        <div className="text-[14px] text-zinc-500 dark:text-zinc-400">
          No heartbeats yet. Set one up to turn raw context into periodic insights.
        </div>
      ) : (
        <div className="space-y-2">
          {heartbeatItems.map((entry) => {
            const frequencyLabel = resolveFrequencyLabel(entry.schedule?.frequency)
            const dayLabel =
              entry.schedule?.frequency === 'weekly'
                ? resolveDayLabel(entry.schedule?.dayOfWeek, weekdayLookup)
                : ''
            const metadata = [
              resolveRunnerLabel(entry.runner),
              dayLabel ? `${frequencyLabel} · ${dayLabel}` : frequencyLabel,
              entry.schedule?.time || '09:00',
              entry.schedule?.timezone || HEARTBEAT_DEFAULT_TIMEZONE
            ]
            return (
              <Card
                key={entry.id || `heartbeat-${entry.topic}`}
                className="p-0"
              >
                <div className="p-3 flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <p className="text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
                      {entry.topic || 'Unnamed heartbeat'}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {metadata.map((label) => (
                        <Badge key={`${entry.id || entry.topic}-${label}`}>{label}</Badge>
                      ))}
                    </div>
                    <p className="text-[14px] text-zinc-500 dark:text-zinc-400">
                      {runningHeartbeatIds?.[entry.id] ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <svg
                            viewBox="0 0 24 24"
                            className="w-3 h-3 animate-spin"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path
                              d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M16.9 16.9l2.1 2.1M2 12h3M19 12h3M4.9 19.1l2.1-2.1M16.9 7.1l2.1-2.1"
                            />
                          </svg>
                          Running
                        </span>
                      ) : (
                        resolveLastRunText(entry, toDisplayText)
                      )}
                    </p>
                    {entry.lastRunError ? (
                      <p className="text-[14px] text-red-500 dark:text-red-400" title={entry.lastRunError}>
                        {entry.lastRunError}
                      </p>
                    ) : null}
                  </div>
                  <Label className="inline-flex items-center gap-2 text-[14px] text-zinc-600 dark:text-zinc-300">
                    <Checkbox
                      type="checkbox"
                      className="h-3.5 w-3.5 accent-indigo-600 dark:accent-indigo-400"
                      checked={entry.enabled !== false}
                      onChange={(event) => {
                        if (typeof setHeartbeatEnabled === 'function') {
                          void setHeartbeatEnabled(entry.id, event.target.checked)
                        }
                      }}
                    />
                    Enabled
                  </Label>
                </div>
                <CardFooter className="px-3 pb-3 pt-2 flex flex-wrap items-center justify-between gap-2">
                  <ButtonGroup>
                    <Button
                      id={`heartbeats-run-${entry.id || 'anonymous'}`}
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onRunNow(entry.id)
                      }}
                      disabled={!entry.id || !hasContextFolder || Boolean(runningHeartbeatIds?.[entry.id])}
                    >
                      Run now
                    </Button>
                  </ButtonGroup>
                  <div className="flex flex-wrap items-center gap-2">
                    <ButtonGroup>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          openEditForm(entry)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          openDuplicateForm(entry)
                        }}
                      >
                        Duplicate
                      </Button>
                    </ButtonGroup>
                    <ButtonGroup>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          void onDelete(entry.id)
                        }}
                        disabled={Boolean(runningHeartbeatIds?.[entry.id])}
                      >
                        Delete
                      </Button>
                    </ButtonGroup>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}

      {isFormOpen ? (
        <section className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
          <CardTitle>
            {editingId ? 'Edit Heartbeat' : 'New Heartbeat'}
          </CardTitle>
          <div className="space-y-3">
            <Label htmlFor="heartbeat-topic" className="section-label">
              Topic
            </Label>
            <Input
              id="heartbeat-topic"
              value={draft.topic}
              onChange={(event) => {
                setDraft((previous) => ({ ...previous, topic: event.target.value }))
              }}
            />
            <Label htmlFor="heartbeat-prompt" className="section-label">
              Prompt
            </Label>
            <Textarea
              id="heartbeat-prompt"
              className="min-h-24"
              value={draft.prompt}
              onChange={(event) => {
                setDraft((previous) => ({ ...previous, prompt: event.target.value }))
              }}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="heartbeat-runner" className="section-label">
                  Runner
                </Label>
                <Select
                  id="heartbeat-runner"
                  className="input-ring w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-[14px]"
                  value={draft.runner}
                  onChange={(event) => {
                    setDraft((previous) => ({ ...previous, runner: event.target.value }))
                  }}
                >
                  {runnerLookup.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {getLabel(mc?.dashboard?.heartbeats, entry, entry.label)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="heartbeat-frequency" className="section-label">
                  Frequency
                </Label>
                <Select
                  id="heartbeat-frequency"
                  className="input-ring w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-[14px]"
                  value={draft.frequency}
                  onChange={(event) => {
                    setDraft((previous) => ({ ...previous, frequency: event.target.value }))
                  }}
                >
                  {frequencyLookup.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {getLabel(mc?.dashboard?.heartbeats, entry, entry.label)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="heartbeat-time" className="section-label">Time</Label>
                <Input
                  id="heartbeat-time"
                  type="time"
                  value={draft.time}
                  onChange={(event) => {
                    setDraft((previous) => ({ ...previous, time: event.target.value }))
                  }}
                />
              </div>
              {isWeekly ? (
                <div className="space-y-1">
                  <Label htmlFor="heartbeat-day-of-week" className="section-label">
                    Day of week
                  </Label>
                  <Select
                    id="heartbeat-day-of-week"
                    className="input-ring w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-[14px]"
                    value={draft.dayOfWeek}
                    onChange={(event) => {
                      setDraft((previous) => ({ ...previous, dayOfWeek: event.target.value }))
                    }}
                  >
                    {weekdayLookup.map((entry) => (
                      <option key={entry.value} value={entry.value}>
                        {entry.label}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : (
                <div />
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="heartbeat-timezone" className="section-label">Timezone</Label>
              <Select
                id="heartbeat-timezone"
                className="input-ring w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg py-2 px-3 text-[14px]"
                value={draft.timezone}
                onChange={(event) => {
                  setDraft((previous) => ({ ...previous, timezone: event.target.value }))
                }}
              >
                {timezoneOptions.map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </Select>
            </div>

            <Label className="inline-flex items-center gap-2">
              <Checkbox
                type="checkbox"
                className="h-4 w-4 accent-indigo-600 dark:accent-indigo-400"
                checked={draft.enabled}
                onChange={(event) => {
                  setDraft((previous) => ({ ...previous, enabled: event.target.checked }))
                }}
              />
              Enabled
            </Label>

            {formError ? (
              <p className="text-[14px] text-red-600 dark:text-red-400" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="flex items-center gap-2">
              <Button
                id="heartbeat-save"
                type="button"
                variant="default"
                size="sm"
                disabled={isFormSubmitting}
                onClick={() => {
                  void save()
                }}
              >
                Save
              </Button>
              <Button
                id="heartbeat-cancel"
                type="button"
                variant="outline"
                size="sm"
                onClick={closeForm}
                disabled={isFormSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </section>
      ) : null}
    </section>
  )
}
