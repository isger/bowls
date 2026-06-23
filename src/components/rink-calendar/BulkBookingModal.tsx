'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { BOOKING_TYPES } from '@/lib/booking-types'
import type { BookingType, BookingWithPlayers, Rink, TimeSlot } from '@/lib/db/schema'
import { addDays, addWeeks, format, getDay, parseISO } from 'date-fns'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

type RecurrenceMode = 'once' | 'weekly' | 'custom'

interface ConflictItem { date: string; rinkId: number }

interface Props {
  open: boolean
  onClose: () => void
  onSave: (bookings: BookingWithPlayers[]) => void
  date: string
  rinks: Rink[]
  timeSlots: TimeSlot[]
}

function friendlyDate(iso: string) {
  return format(parseISO(iso), 'EEE d MMM')
}

export function BulkBookingModal({ open, onClose, onSave, date, rinks, timeSlots }: Props) {
  const [selectedRinkIds, setSelectedRinkIds] = useState<Set<number>>(new Set(rinks.map((r) => r.id)))
  const [timeSlotId, setTimeSlotId] = useState<number | null>(null)
  const [durationSlots, setDurationSlots] = useState(1)
  const [type, setType] = useState<BookingType | ''>('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')

  const [recurrence, setRecurrence] = useState<RecurrenceMode>('once')
  const [weeklyCount, setWeeklyCount] = useState(4)
  const [weeklyDay, setWeeklyDay] = useState<number>(getDay(parseISO(date)))
  const [customDates, setCustomDates] = useState<Date[]>([])

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ rinks?: string; slot?: string; type?: string; title?: string; dates?: string }>({})
  const [result, setResult] = useState<{ created: number; conflicts: ConflictItem[] } | null>(null)

  const [allowedDurations, setAllowedDurations] = useState<number[]>([])
  const [durationsLoaded, setDurationsLoaded] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedRinkIds(new Set(rinks.map((r) => r.id)))
      setTimeSlotId(null)
      setDurationSlots(1)
      setType('')
      setTitle('')
      setNotes('')
      setRecurrence('once')
      setWeeklyCount(4)
      setWeeklyDay(getDay(parseISO(date)))
      setCustomDates([])
      setError(null)
      setFieldErrors({})
      setResult(null)

      if (!durationsLoaded) {
        fetch('/api/durations')
          .then((r) => r.json())
          .then((d) => {
            const durations: number[] = d.durations ?? []
            setAllowedDurations(durations)
            setDurationsLoaded(true)
            if (durations.length > 0) setDurationSlots(durations[0])
          })
      }
    }
  }, [open, rinks])

  function getDates(): string[] {
    if (recurrence === 'once') return [date]
    if (recurrence === 'weekly') {
      const base = parseISO(date)
      const diff = (weeklyDay - getDay(base) + 7) % 7
      const first = addDays(base, diff)
      return Array.from({ length: weeklyCount }, (_, i) => format(addWeeks(first, i), 'yyyy-MM-dd'))
    }
    return customDates.map((d) => format(d, 'yyyy-MM-dd')).sort()
  }

  function toggleRink(id: number) {
    setSelectedRinkIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
    setFieldErrors((p) => ({ ...p, rinks: undefined }))
  }

  function toggleAll() {
    setSelectedRinkIds(selectedRinkIds.size === rinks.length ? new Set() : new Set(rinks.map((r) => r.id)))
    setFieldErrors((p) => ({ ...p, rinks: undefined }))
  }

  async function handleSave() {
    const dates = getDates()
    const errs = {
      rinks: selectedRinkIds.size === 0 ? 'Select at least one rink' : undefined,
      slot: !timeSlotId ? 'Please select a starting time' : undefined,
      type: !type ? 'Please select a booking type' : undefined,
      title: !title.trim() ? 'Title is required' : undefined,
      dates: recurrence === 'custom' && dates.length === 0 ? 'Select at least one date' : undefined,
    }
    setFieldErrors(errs)
    if (Object.values(errs).some(Boolean)) return

    setSaving(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/bookings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates, rinkIds: [...selectedRinkIds], timeSlotId, durationSlots, type, title, notes }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong')
        return
      }
      setResult({ created: data.bookings.length, conflicts: data.conflicts ?? [] })
      if (data.bookings.length > 0) onSave(data.bookings)
    } finally {
      setSaving(false)
    }
  }

  const allSelected = selectedRinkIds.size === rinks.length
  const startIdx = timeSlotId ? timeSlots.findIndex((s) => s.id === timeSlotId) : -1
  const maxDuration = startIdx >= 0 ? timeSlots.length - startIdx : 12
  const dates = getDates()
  const dateCount = dates.length

  // Group conflicts by date for display
  const conflictsByDate = new Map<string, string[]>()
  for (const c of result?.conflicts ?? []) {
    const rink = rinks.find((r) => r.id === c.rinkId)
    const name = rink?.label ?? `Rink ${rink?.number ?? c.rinkId}`
    if (!conflictsByDate.has(c.date)) conflictsByDate.set(c.date, [])
    conflictsByDate.get(c.date)!.push(name)
  }
  const conflictDates = [...conflictsByDate.entries()].sort(([a], [b]) => a.localeCompare(b))

  const submitLabel = result
    ? undefined
    : selectedRinkIds.size === 0
    ? 'Book Rinks'
    : dateCount <= 1
    ? `Book ${selectedRinkIds.size} Rink${selectedRinkIds.size !== 1 ? 's' : ''}`
    : `Book ${selectedRinkIds.size} Rink${selectedRinkIds.size !== 1 ? 's' : ''} × ${dateCount} Dates`

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl">Bulk Book Rinks</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2 overflow-y-auto flex-1 min-h-0 pr-1">
          {/* Rink selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Rinks <span className="text-red-500">*</span>
              </Label>
              <button
                onClick={toggleAll}
                className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </button>
            </div>
            <div className={`grid grid-cols-2 gap-2 ${fieldErrors.rinks ? 'ring-1 ring-red-400 rounded-lg p-1' : ''}`}>
              {rinks.map((rink) => {
                const checked = selectedRinkIds.has(rink.id)
                return (
                  <button
                    key={rink.id}
                    onClick={() => toggleRink(rink.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 text-left transition-colors ${
                      checked
                        ? 'border-slate-800 dark:border-slate-200 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${checked ? 'border-white dark:border-slate-900' : 'border-current opacity-40'}`}>
                      {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </span>
                    <span className="text-sm font-semibold truncate">{rink.label ?? `Rink ${rink.number}`}</span>
                  </button>
                )
              })}
            </div>
            {fieldErrors.rinks && <p className="text-xs text-red-600">{fieldErrors.rinks}</p>}
            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedRinkIds.size} of {rinks.length} rinks selected</p>
          </div>

          {/* Starting at + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Starting at <span className="text-red-500">*</span></Label>
              <Select value={timeSlotId?.toString() ?? ''} onValueChange={(v) => { setTimeSlotId(Number(v)); setFieldErrors((p) => ({ ...p, slot: undefined })) }}>
                <SelectTrigger className={`h-11 text-base ${fieldErrors.slot ? 'border-red-400 ring-red-400' : ''}`}>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()} className="text-base py-2">
                      {s.startTime}–{s.endTime}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.slot && <p className="text-xs text-red-600">{fieldErrors.slot}</p>}
            </div>

            {allowedDurations.length > 0 && (
              <div className="space-y-2">
                <Label className="text-base font-semibold">Duration</Label>
                <Select value={durationSlots.toString()} onValueChange={(v) => setDurationSlots(Number(v))}>
                  <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {allowedDurations.filter((d) => d <= maxDuration).map((d) => {
                      const endSlot = startIdx >= 0 ? timeSlots[startIdx + d - 1] : null
                      return (
                        <SelectItem key={d} value={d.toString()} className="text-base py-2">
                          {d === 1 ? '1 Hour' : `${d} Hours`}{endSlot ? ` (until ${endSlot.endTime})` : ''}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Booking Type <span className="text-red-500">*</span></Label>
            <Select value={type} onValueChange={(v) => { setType(v as BookingType); setFieldErrors((p) => ({ ...p, type: undefined })) }}>
              <SelectTrigger className={`h-11 text-base ${fieldErrors.type ? 'border-red-400 ring-red-400' : ''}`}>
                <SelectValue placeholder="Select a type…" />
              </SelectTrigger>
              <SelectContent>
                {BOOKING_TYPES.map((t) => <SelectItem key={t.value} value={t.value} className="text-base py-2">{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {fieldErrors.type && <p className="text-xs text-red-600">{fieldErrors.type}</p>}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Title <span className="text-red-500">*</span></Label>
            <Input
              className={`h-11 text-base ${fieldErrors.title ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setFieldErrors((p) => ({ ...p, title: undefined })) }}
              placeholder="e.g. Club Day"
            />
            {fieldErrors.title && <p className="text-xs text-red-600">{fieldErrors.title}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Notes <span className="text-slate-400 font-normal">(optional)</span></Label>
            <Textarea className="text-base" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Any additional details…" />
          </div>

          <Separator />

          {/* Recurrence */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Repeat</Label>

            {/* Mode tabs */}
            <div className="flex rounded-lg border-2 border-slate-200 dark:border-slate-700 overflow-hidden text-sm w-fit">
              {(['once', 'weekly', 'custom'] as RecurrenceMode[]).map((mode) => {
                const labels = { once: 'Once', weekly: 'Weekly', custom: 'Custom dates' }
                return (
                  <button
                    key={mode}
                    onClick={() => { setRecurrence(mode); setFieldErrors((p) => ({ ...p, dates: undefined })) }}
                    className={`px-4 py-2 font-semibold transition-colors ${
                      recurrence === mode
                        ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {labels[mode]}
                  </button>
                )
              })}
            </div>

            {recurrence === 'once' && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Booking on <span className="font-medium text-slate-700 dark:text-slate-300">{friendlyDate(date)}</span> only.
              </p>
            )}

            {recurrence === 'weekly' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-300">Every</p>
                  <div className="flex gap-1.5">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label, idx) => (
                      <button
                        key={idx}
                        onClick={() => setWeeklyDay(idx)}
                        className={`flex-1 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                          weeklyDay === idx
                            ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200'
                            : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-600 dark:text-slate-300">For</span>
                  <Select value={weeklyCount.toString()} onValueChange={(v) => setWeeklyCount(Number(v))}>
                    <SelectTrigger className="h-9 text-sm w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[2, 3, 4, 6, 8, 12, 16, 20, 26].map((n) => (
                        <SelectItem key={n} value={n.toString()} className="text-sm">{n} weeks</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {friendlyDate(dates[0])} to {friendlyDate(dates[dates.length - 1])}, {dateCount} dates total
                </p>
              </div>
            )}

            {recurrence === 'custom' && (
              <div className="space-y-2">
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <Calendar
                    mode="multiple"
                    selected={customDates}
                    onSelect={(days) => {
                      setCustomDates(days ?? [])
                      setFieldErrors((p) => ({ ...p, dates: undefined }))
                    }}
                    disabled={{ before: today }}
                    className="mx-auto"
                  />
                </div>
                {customDates.length > 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {customDates.length} date{customDates.length !== 1 ? 's' : ''} selected:{' '}
                    {customDates
                      .map((d) => format(d, 'yyyy-MM-dd'))
                      .sort()
                      .map(friendlyDate)
                      .join(', ')}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500">Click days on the calendar to select them</p>
                )}
                {fieldErrors.dates && <p className="text-xs text-red-600">{fieldErrors.dates}</p>}
              </div>
            )}
          </div>

          {error && <p className="text-base text-red-600 font-medium">{error}</p>}

          {/* Result summary */}
          {result && (
            <div className="space-y-2">
              {result.created > 0 && (
                <div className="flex items-start gap-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-500" />
                  <span>
                    <span className="font-semibold">{result.created} booking{result.created !== 1 ? 's' : ''}</span>{' '}
                    created
                    {dateCount > 1 ? ` across ${dateCount} date${dateCount !== 1 ? 's' : ''}` : ''}.
                  </span>
                </div>
              )}
              {result.created === 0 && result.conflicts.length > 0 && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-800 dark:text-red-300">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
                  <span className="font-semibold">Nothing booked. All selected slots are already taken.</span>
                </div>
              )}
              {conflictDates.length > 0 && (
                <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
                    <AlertCircle size={15} className="text-amber-500" />
                    {result.conflicts.length} slot{result.conflicts.length !== 1 ? 's' : ''} skipped, already booked:
                  </div>
                  <ul className="space-y-0.5 pl-5">
                    {conflictDates.map(([d, rinkNames]) => (
                      <li key={d} className="text-sm text-amber-700 dark:text-amber-400">
                        <span className="font-medium">{friendlyDate(d)}</span>
                        {': '}
                        {rinkNames.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3 sm:justify-end shrink-0">
          <Button variant="outline" className="flex-1 sm:flex-none h-12 sm:h-9 text-base sm:text-sm" onClick={onClose}>
            {result ? 'Close' : 'Cancel'}
          </Button>
          {!result && (
            <Button className="flex-1 sm:flex-none h-12 sm:h-9 text-base sm:text-sm" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin mr-2" />}
              {submitLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
