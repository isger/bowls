'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { BOOKING_TYPES } from '@/lib/booking-types'
import type { BookingType, BookingWithPlayers, Rink, TimeSlot } from '@/lib/db/schema'
import { Loader2, Trash2, X, UserPlus, User, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface PlayerInput {
  userId?: string
  name: string
}

interface Member {
  id: string
  name: string
  email: string
  role: string
}

interface Props {
  open: boolean
  onClose: () => void
  onSave: (booking: BookingWithPlayers) => void
  onDelete: (id: number) => void
  date: string
  rinkId: number | null
  timeSlotId: number | null
  existing?: BookingWithPlayers
  rinks: Rink[]
  timeSlots: TimeSlot[]
  bookings: BookingWithPlayers[]
  canDelete: boolean
}

export function BookingModal({
  open, onClose, onSave, onDelete,
  date, rinkId, timeSlotId, existing, rinks, timeSlots, bookings, canDelete,
}: Props) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<BookingType | ''>('')
  const [notes, setNotes] = useState('')
  const [selectedRinkId, setSelectedRinkId] = useState<number | null>(rinkId)
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(timeSlotId)
  const [durationSlots, setDurationSlots] = useState(1)
  const [players, setPlayers] = useState<PlayerInput[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ rink?: string; slot?: string; type?: string; title?: string }>({})

  const [confirmRemoveIndex, setConfirmRemoveIndex] = useState<number | null>(null)

  // Player add state
  const [addMode, setAddMode] = useState<'member' | 'guest'>('member')
  const [guestName, setGuestName] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [membersLoaded, setMembersLoaded] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(existing?.title ?? '')
      setType(existing?.type ?? '')
      setNotes(existing?.notes ?? '')
      setSelectedRinkId(rinkId)
      setSelectedSlotId(timeSlotId)
      setDurationSlots(existing?.durationSlots ?? 1)
      setPlayers(existing?.players.map((p) => ({ userId: p.userId ?? undefined, name: p.name })) ?? [])
      setGuestName('')
      setMemberSearch('')
      setError(null)
      setFieldErrors({})
      setConfirmRemoveIndex(null)

      if (!membersLoaded) {
        fetch('/api/members')
          .then((r) => r.json())
          .then((d) => { setMembers(d.members ?? []); setMembersLoaded(true) })
      }
    }
  }, [open, existing, rinkId, timeSlotId])

  function addMemberById(id: string) {
    const member = members.find((m) => m.id === id)
    if (!member || players.some((p) => p.userId === member.id)) return
    setPlayers((prev) => [...prev, { userId: member.id, name: member.name }])
  }

  function addGuest() {
    const name = guestName.trim()
    if (!name) return
    setPlayers((prev) => [...prev, { name }])
    setGuestName('')
  }

  function removePlayer(index: number) {
    setPlayers((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    const errs = {
      rink: !selectedRinkId ? 'Please select a rink' : undefined,
      slot: !selectedSlotId ? 'Please select a time slot' : undefined,
      type: !type ? 'Please select a booking type' : undefined,
      title: !title.trim() ? 'Title is required' : undefined,
    }
    setFieldErrors(errs)
    if (errs.rink || errs.slot || errs.type || errs.title) return
    setSaving(true)
    setError(null)
    try {
      const url = existing ? `/api/bookings/${existing.id}` : '/api/bookings'
      const method = existing ? 'PATCH' : 'POST'
      const body = existing
        ? { title, type, notes, players }
        : { date, rinkId: selectedRinkId, timeSlotId: selectedSlotId, durationSlots, type, title, notes, players }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong')
        return
      }
      onSave(data.booking)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!existing) return
    setDeleting(true)
    try {
      await fetch(`/api/bookings/${existing.id}`, { method: 'DELETE' })
      onDelete(existing.id)
    } finally {
      setDeleting(false)
    }
  }

  const availableMembers = members.filter((m) => !players.some((p) => p.userId === m.id))
  const filteredMembers = memberSearch.trim()
    ? availableMembers.filter((m) =>
        m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.email.toLowerCase().includes(memberSearch.toLowerCase())
      )
    : availableMembers

  const conflictingBooking = !existing && selectedRinkId && selectedSlotId
    ? (() => {
        const startIdx = timeSlots.findIndex((s) => s.id === selectedSlotId)
        if (startIdx === -1) return undefined
        const newSlotIds = new Set(
          timeSlots.slice(startIdx, startIdx + durationSlots).map((s) => s.id)
        )
        return bookings.find((b) => {
          if (b.rinkId !== selectedRinkId) return false
          const bIdx = timeSlots.findIndex((s) => s.id === b.timeSlotId)
          if (bIdx === -1) return false
          const bSlotIds = timeSlots.slice(bIdx, bIdx + (b.durationSlots ?? 1)).map((s) => s.id)
          return bSlotIds.some((id) => newSlotIds.has(id))
        })
      })()
    : undefined

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg flex flex-col max-h-[90vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl">{existing ? 'Edit Booking' : 'New Booking'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2 overflow-y-auto flex-1 min-h-0 pr-1">
          {/* Rink + Time Slot */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Rink <span className="text-red-500">*</span></Label>
              <Select value={selectedRinkId?.toString() ?? ''} onValueChange={(v) => { setSelectedRinkId(Number(v)); setFieldErrors((p) => ({ ...p, rink: undefined })) }} disabled={!!existing}>
                <SelectTrigger className={`h-11 text-base ${fieldErrors.rink ? 'border-red-400 ring-red-400' : ''}`}><SelectValue placeholder="Select rink" /></SelectTrigger>
                <SelectContent>
                  {rinks.map((r) => <SelectItem key={r.id} value={r.id.toString()} className="text-base py-2">{r.label ?? `Rink ${r.number}`}</SelectItem>)}
                </SelectContent>
              </Select>
              {fieldErrors.rink && <p className="text-xs text-red-600">{fieldErrors.rink}</p>}
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">Time Slot <span className="text-red-500">*</span></Label>
              <Select value={selectedSlotId?.toString() ?? ''} onValueChange={(v) => { setSelectedSlotId(Number(v)); setFieldErrors((p) => ({ ...p, slot: undefined })) }} disabled={!!existing}>
                <SelectTrigger className={`h-11 text-base ${fieldErrors.slot ? 'border-red-400 ring-red-400' : ''}`}><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map((s) => <SelectItem key={s.id} value={s.id.toString()} className="text-base py-2">{s.startTime}–{s.endTime}</SelectItem>)}
                </SelectContent>
              </Select>
              {fieldErrors.slot && <p className="text-xs text-red-600">{fieldErrors.slot}</p>}
            </div>
          </div>

          {/* Duration */}
          {!existing && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Duration</Label>
              <Select
                value={durationSlots.toString()}
                onValueChange={(v) => setDurationSlots(Number(v))}
              >
                <SelectTrigger className="h-11 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const startIdx = selectedSlotId
                      ? timeSlots.findIndex((s) => s.id === selectedSlotId)
                      : -1
                    const maxDuration = startIdx >= 0 ? timeSlots.length - startIdx : 12
                    return Array.from({ length: Math.min(12, maxDuration) }, (_, i) => i + 1).map((d) => {
                      const endSlot = startIdx >= 0 ? timeSlots[startIdx + d - 1] : null
                      return (
                        <SelectItem key={d} value={d.toString()} className="text-base py-2">
                          {d === 1 ? '1 Hour' : `${d} Hours`}
                          {endSlot ? ` (until ${endSlot.endTime})` : ''}
                        </SelectItem>
                      )
                    })
                  })()}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Conflict warning */}
          {conflictingBooking && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 text-base text-amber-800 dark:text-amber-300">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-500" />
              <span>
                This slot is already booked: <span className="font-semibold">{conflictingBooking.title}</span>
              </span>
            </div>
          )}

          {/* Type */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Booking Type <span className="text-red-500">*</span></Label>
            <Select value={type} onValueChange={(v) => { setType(v as BookingType); setFieldErrors((p) => ({ ...p, type: undefined })) }}>
              <SelectTrigger className={`h-11 text-base ${fieldErrors.type ? 'border-red-400 ring-red-400' : ''}`}><SelectValue placeholder="Select a type…" /></SelectTrigger>
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
              placeholder="e.g. Club Roll-Up"
            />
            {fieldErrors.title && <p className="text-xs text-red-600">{fieldErrors.title}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Notes <span className="text-slate-400 font-normal">(optional)</span></Label>
            <Textarea className="text-base" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Any additional details…" />
          </div>

          {error && <p className="text-base text-red-600 font-medium">{error}</p>}

          <Separator />

          {/* Players */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Players</Label>

            {/* Added players */}
            {players.length > 0 && (
              <ul className="space-y-1.5">
                {players.map((p, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {confirmRemoveIndex === i ? (
                      <>
                        <span className="text-sm text-slate-600 dark:text-slate-300">Remove <span className="font-semibold">{p.name}</span> from this booking?</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => { removePlayer(i); setConfirmRemoveIndex(null) }}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          >
                            Remove
                          </button>
                          <button
                            onClick={() => setConfirmRemoveIndex(null)}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 min-w-0">
                          <User size={15} className="text-slate-400 dark:text-slate-500 shrink-0" />
                          <span className="truncate text-base font-medium">{p.name}</span>
                        </div>
                        <button onClick={() => setConfirmRemoveIndex(i)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 shrink-0 p-1">
                          <X size={16} />
                        </button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}

            {/* Add player controls */}
            <div className="space-y-3">
              <div className="flex rounded-lg border-2 border-slate-200 dark:border-slate-700 overflow-hidden text-sm w-fit">
                <button
                  onClick={() => setAddMode('member')}
                  className={`px-4 py-2 font-semibold transition-colors ${addMode === 'member' ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  Add Member
                </button>
                <button
                  onClick={() => setAddMode('guest')}
                  className={`px-4 py-2 font-semibold transition-colors ${addMode === 'guest' ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  Add Guest
                </button>
              </div>

              {addMode === 'member' ? (
                <div className="space-y-2">
                  {availableMembers.length === 0 ? (
                    <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-2">All members added</p>
                  ) : (
                    <>
                      <input
                        placeholder="Search members…"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="w-full h-11 text-base px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:border-slate-400 dark:focus:border-slate-500"
                      />
                      <ul className="max-h-80 overflow-y-auto rounded-md border border-slate-200 dark:border-slate-700">
                        {filteredMembers.length === 0 ? (
                          <li className="px-3 py-4 text-sm text-slate-400 dark:text-slate-500 text-center">No members found</li>
                        ) : filteredMembers.map((m, i) => (
                          <li key={m.id}>
                            <button
                              onClick={() => addMemberById(m.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:brightness-95 active:brightness-90 ${
                                i % 2 === 0
                                  ? 'bg-white dark:bg-slate-900'
                                  : 'bg-slate-50 dark:bg-slate-800/60'
                              }`}
                            >
                              <UserPlus size={15} className="text-slate-400 dark:text-slate-500 shrink-0" />
                              <div className="min-w-0">
                                <div className="text-base font-medium text-slate-800 dark:text-slate-200 truncate">{m.name}</div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 truncate">{m.email}</div>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    className="flex-1 h-11 text-base"
                    placeholder="Guest name…"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addGuest()}
                  />
                  <Button variant="outline" className="h-11 px-4" onClick={addGuest} disabled={!guestName.trim()}>
                    <UserPlus size={16} className="mr-1" /> Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-3 shrink-0">
          {existing && canDelete && (
            <Button variant="destructive" className="h-12 sm:h-9 text-base sm:text-sm" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
              Delete Booking
            </Button>
          )}
          <div className="flex gap-3 sm:ml-auto">
            <Button variant="outline" className="flex-1 sm:flex-none h-12 sm:h-9 text-base sm:text-sm" onClick={onClose}>Cancel</Button>
            <Button className="flex-1 sm:flex-none h-12 sm:h-9 text-base sm:text-sm" onClick={handleSave} disabled={saving || !!conflictingBooking}>
              {saving && <Loader2 size={16} className="animate-spin mr-2" />}
              {existing ? 'Save Changes' : 'Create Booking'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
