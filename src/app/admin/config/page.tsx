'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

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

export default function ConfigPage() {
  // Rinks state
  const [rinks, setRinks] = useState<Rink[]>([])
  const [rinksLoading, setRinksLoading] = useState(true)
  const [rinkModalOpen, setRinkModalOpen] = useState(false)
  const [rinkNumber, setRinkNumber] = useState('')
  const [rinkLabel, setRinkLabel] = useState('')
  const [rinkSaving, setRinkSaving] = useState(false)
  const [rinkError, setRinkError] = useState<string | null>(null)

  // Time slots state
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(true)
  const [slotModalOpen, setSlotModalOpen] = useState(false)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [slotSaving, setSlotSaving] = useState(false)
  const [slotError, setSlotError] = useState<string | null>(null)
  const [deletingSlotId, setDeletingSlotId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/rinks')
      .then((r) => r.json())
      .then((d) => setRinks(d.rinks ?? []))
      .finally(() => setRinksLoading(false))

    fetch('/api/timeslots')
      .then((r) => r.json())
      .then((d) => setSlots(d.timeSlots ?? []))
      .finally(() => setSlotsLoading(false))
  }, [])

  // Rink handlers
  function openRinkModal() {
    setRinkNumber('')
    setRinkLabel('')
    setRinkError(null)
    setRinkModalOpen(true)
  }

  async function handleCreateRink() {
    const n = parseInt(rinkNumber)
    if (isNaN(n)) return
    setRinkSaving(true)
    setRinkError(null)
    try {
      const res = await fetch('/api/rinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: n, label: rinkLabel || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRinkError(typeof data.error === 'string' ? data.error : 'Something went wrong')
        return
      }
      setRinks((prev) => [...prev, data.rink].sort((a, b) => a.number - b.number))
      setRinkModalOpen(false)
    } finally {
      setRinkSaving(false)
    }
  }

  async function toggleActive(rink: Rink) {
    const res = await fetch(`/api/rinks/${rink.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !rink.isActive }),
    })
    if (res.ok) {
      const data = await res.json()
      setRinks((prev) => prev.map((r) => (r.id === rink.id ? data.rink : r)))
    }
  }

  // Time slot handlers
  function openSlotModal() {
    setStartTime('')
    setEndTime('')
    setSlotError(null)
    setSlotModalOpen(true)
  }

  async function handleCreateSlot() {
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
      setSlotModalOpen(false)
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
        alert(typeof data.error === 'string' ? data.error : 'Could not delete time slot')
      }
    } finally {
      setDeletingSlotId(null)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Configuration</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage club settings</p>
      </div>

      {/* Rinks */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Rinks</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure the rinks shown on the diary</p>
          </div>
          <Button size="sm" onClick={openRinkModal}>
            <Plus size={16} className="mr-2" />
            Add rink
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
          {rinksLoading ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">Loading…</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Number</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Label</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rinks.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{r.number}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.label ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={r.isActive ? 'default' : 'secondary'}>
                        {r.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => toggleActive(r)}>
                        {r.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
                {rinks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                      No rinks configured yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Time Slots */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200">Time Slots</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Configure the booking time blocks shown on the diary</p>
          </div>
          <Button size="sm" onClick={openSlotModal}>
            <Plus size={16} className="mr-2" />
            Add time slot
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
          {slotsLoading ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500">Loading…</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Start</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 dark:text-slate-400">End</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {slots.map((s, i) => (
                  <tr key={s.id} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{s.startTime}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.endTime}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSlot(s.id)}
                        disabled={deletingSlotId === s.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 h-7"
                      >
                        {deletingSlotId === s.id
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />}
                      </Button>
                    </td>
                  </tr>
                ))}
                {slots.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400 dark:text-slate-500">
                      No time slots configured yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Add Rink modal */}
      <Dialog open={rinkModalOpen} onOpenChange={setRinkModalOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Add rink</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Rink number <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                min={1}
                max={99}
                value={rinkNumber}
                onChange={(e) => setRinkNumber(e.target.value)}
                placeholder="e.g. 7"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Label <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Input
                value={rinkLabel}
                onChange={(e) => setRinkLabel(e.target.value)}
                placeholder="e.g. Championship Rink"
              />
            </div>
            {rinkError && <p className="text-sm text-red-600">{rinkError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRinkModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateRink} disabled={rinkSaving || !rinkNumber}>
              {rinkSaving && <Loader2 size={14} className="animate-spin mr-1" />}
              Add rink
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Time Slot modal */}
      <Dialog open={slotModalOpen} onOpenChange={setSlotModalOpen}>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Add time slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Start time <span className="text-red-500">*</span></Label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>End time <span className="text-red-500">*</span></Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            {slotError && <p className="text-sm text-red-600">{slotError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSlotModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreateSlot} disabled={slotSaving || !startTime || !endTime}>
              {slotSaving && <Loader2 size={14} className="animate-spin mr-1" />}
              Add time slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
