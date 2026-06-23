'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Trash2, Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface Rink {
  id: number
  number: number
  label: string | null
  isActive: boolean
}

interface TimeSlot {
  id: number
  startTime: string
  endTime: string
  sortOrder: number
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={[
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-slate-800 dark:bg-slate-200' : 'bg-slate-200 dark:bg-slate-700',
      ].join(' ')}
    >
      <span className={[
        'pointer-events-none inline-block h-4 w-4 rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition-transform duration-200',
        checked ? 'translate-x-4' : 'translate-x-0',
      ].join(' ')} />
    </button>
  )
}

export default function ConfigPage() {
  const [rinks, setRinks] = useState<Rink[]>([])
  const [rinksLoading, setRinksLoading] = useState(true)
  const [togglingRinkId, setTogglingRinkId] = useState<number | null>(null)
  const [rinkNumber, setRinkNumber] = useState('')
  const [rinkLabel, setRinkLabel] = useState('')
  const [rinkSaving, setRinkSaving] = useState(false)
  const [rinkError, setRinkError] = useState<string | null>(null)

  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [slotSaving, setSlotSaving] = useState(false)
  const [slotError, setSlotError] = useState<string | null>(null)
  const [deletingSlotId, setDeletingSlotId] = useState<number | null>(null)

  const [enabledDurations, setEnabledDurations] = useState<Set<number>>(new Set())
  const [durationsLoading, setDurationsLoading] = useState(true)
  const [togglingDuration, setTogglingDuration] = useState<number | null>(null)

  const rinkLabelRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/rinks')
      .then((r) => r.json())
      .then((d) => setRinks(d.rinks ?? []))
      .finally(() => setRinksLoading(false))

    fetch('/api/timeslots')
      .then((r) => r.json())
      .then((d) => setSlots(d.timeSlots ?? []))
      .finally(() => setSlotsLoading(false))

    fetch('/api/durations')
      .then((r) => r.json())
      .then((d) => setEnabledDurations(new Set(d.durations ?? [])))
      .finally(() => setDurationsLoading(false))
  }, [])

  async function toggleRinkActive(rink: Rink) {
    setTogglingRinkId(rink.id)
    try {
      const res = await fetch(`/api/rinks/${rink.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !rink.isActive }),
      })
      if (res.ok) {
        const data = await res.json()
        setRinks((prev) => prev.map((r) => (r.id === rink.id ? data.rink : r)))
      }
    } finally {
      setTogglingRinkId(null)
    }
  }

  async function handleAddRink() {
    const n = parseInt(rinkNumber)
    if (isNaN(n)) return
    setRinkSaving(true)
    setRinkError(null)
    try {
      const res = await fetch('/api/rinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: n, label: rinkLabel.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRinkError(typeof data.error === 'string' ? data.error : 'Something went wrong')
        return
      }
      setRinks((prev) => [...prev, data.rink].sort((a, b) => a.number - b.number))
      setRinkNumber('')
      setRinkLabel('')
      rinkLabelRef.current?.focus()
    } finally {
      setRinkSaving(false)
    }
  }

  async function handleAddSlot() {
    setSlotSaving(true)
    setSlotError(null)
    try {
      const res = await fetch('/api/timeslots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime, endTime }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSlotError(typeof data.error === 'string' ? data.error : 'Something went wrong')
        return
      }
      setSlots((prev) => [...prev, data.timeSlot])
      setStartTime('')
      setEndTime('')
    } finally {
      setSlotSaving(false)
    }
  }

  async function handleDeleteSlot(id: number) {
    setDeletingSlotId(id)
    try {
      const res = await fetch(`/api/timeslots/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSlots((prev) => prev.filter((s) => s.id !== id))
      } else {
        const data = await res.json()
        setSlotError(typeof data.error === 'string' ? data.error : 'Could not delete time slot')
      }
    } finally {
      setDeletingSlotId(null)
    }
  }

  async function toggleDuration(d: number) {
    setTogglingDuration(d)
    try {
      if (enabledDurations.has(d)) {
        const res = await fetch(`/api/durations/${d}`, { method: 'DELETE' })
        if (res.ok) setEnabledDurations((prev) => { const next = new Set(prev); next.delete(d); return next })
      } else {
        const res = await fetch('/api/durations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ duration: d }),
        })
        if (res.ok) setEnabledDurations((prev) => new Set([...prev, d]))
      }
    } finally {
      setTogglingDuration(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Configuration</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage club settings</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* ── Rinks ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Rinks</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Toggle to show or hide on the diary</p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {rinksLoading ? (
              <div className="px-5 py-6 text-sm text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Loading…
              </div>
            ) : rinks.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">No rinks yet</div>
            ) : (
              rinks.map((rink) => (
                <div key={rink.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {rink.label ?? `Rink ${rink.number}`}
                    </span>
                    {rink.label && (
                      <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">#{rink.number}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {rink.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <Toggle
                      checked={rink.isActive}
                      onChange={() => toggleRinkActive(rink)}
                      disabled={togglingRinkId === rink.id}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Inline add form */}
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Add rink</p>
            <div className="flex gap-2">
              <Input
                type="number"
                min={1}
                max={99}
                value={rinkNumber}
                onChange={(e) => { setRinkNumber(e.target.value); setRinkError(null) }}
                onKeyDown={(e) => e.key === 'Enter' && rinkLabelRef.current?.focus()}
                placeholder="No."
                className="w-16 text-sm h-9"
              />
              <Input
                ref={rinkLabelRef}
                value={rinkLabel}
                onChange={(e) => setRinkLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRink()}
                placeholder="Label (optional)"
                className="flex-1 text-sm h-9"
              />
              <Button size="sm" className="h-9 px-3" onClick={handleAddRink} disabled={rinkSaving || !rinkNumber}>
                {rinkSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              </Button>
            </div>
            {rinkError && <p className="text-xs text-red-600">{rinkError}</p>}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">
          {/* Time Slots */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">Time Slots</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Booking time blocks shown on the diary</p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {slotsLoading ? (
                <div className="px-5 py-6 text-sm text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Loading…
                </div>
              ) : slots.length === 0 ? (
                <div className="px-5 py-6 text-sm text-slate-400 dark:text-slate-500 text-center">No time slots yet</div>
              ) : (
                slots.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-2.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                      {s.startTime} – {s.endTime}
                    </span>
                    <button
                      onClick={() => handleDeleteSlot(s.id)}
                      disabled={deletingSlotId === s.id}
                      className="text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-40 transition-colors p-1"
                    >
                      {deletingSlotId === s.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Inline add form */}
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Add time slot</p>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => { setStartTime(e.target.value); setSlotError(null) }}
                  className="flex-1 text-sm h-9 tabular-nums"
                />
                <span className="text-slate-400 dark:text-slate-500 text-sm shrink-0">–</span>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => { setEndTime(e.target.value); setSlotError(null) }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSlot()}
                  className="flex-1 text-sm h-9 tabular-nums"
                />
                <Button size="sm" className="h-9 px-3 shrink-0" onClick={handleAddSlot} disabled={slotSaving || !startTime || !endTime}>
                  {slotSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                </Button>
              </div>
              {slotError && <p className="text-xs text-red-600">{slotError}</p>}
            </div>
          </div>

          {/* Booking Durations */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">Booking Durations</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Allowed lengths when creating a booking</p>
            </div>

            <div className="px-5 py-4">
              {durationsLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
                  <Loader2 size={14} className="animate-spin" /> Loading…
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((d) => {
                    const enabled = enabledDurations.has(d)
                    const toggling = togglingDuration === d
                    return (
                      <button
                        key={d}
                        onClick={() => toggleDuration(d)}
                        disabled={toggling}
                        className={[
                          'h-9 w-12 rounded-md text-sm font-medium border transition-colors disabled:opacity-50',
                          enabled
                            ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200'
                            : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500',
                        ].join(' ')}
                      >
                        {toggling ? <Loader2 size={13} className="animate-spin mx-auto" /> : `${d}h`}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
