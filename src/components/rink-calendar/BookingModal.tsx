'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
  const [players, setPlayers] = useState<PlayerInput[]>([])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Player add state
  const [addMode, setAddMode] = useState<'member' | 'guest'>('member')
  const [guestName, setGuestName] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState<string>('')
  const [members, setMembers] = useState<Member[]>([])
  const [membersLoaded, setMembersLoaded] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(existing?.title ?? '')
      setType(existing?.type ?? '')
      setNotes(existing?.notes ?? '')
      setSelectedRinkId(rinkId)
      setSelectedSlotId(timeSlotId)
      setPlayers(existing?.players.map((p) => ({ userId: p.userId ?? undefined, name: p.name })) ?? [])
      setGuestName('')
      setSelectedMemberId('')
      setError(null)

      if (!membersLoaded) {
        fetch('/api/members')
          .then((r) => r.json())
          .then((d) => { setMembers(d.members ?? []); setMembersLoaded(true) })
      }
    }
  }, [open, existing, rinkId, timeSlotId])

  function addMember() {
    const member = members.find((m) => m.id === selectedMemberId)
    if (!member) return
    if (players.some((p) => p.userId === member.id)) return
    setPlayers((prev) => [...prev, { userId: member.id, name: member.name }])
    setSelectedMemberId('')
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
    if (!title.trim() || !type || !selectedRinkId || !selectedSlotId) return
    setSaving(true)
    setError(null)
    try {
      const url = existing ? `/api/bookings/${existing.id}` : '/api/bookings'
      const method = existing ? 'PATCH' : 'POST'
      const body = existing
        ? { title, type, notes, players }
        : { date, rinkId: selectedRinkId, timeSlotId: selectedSlotId, type, title, notes, players }

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

  const conflictingBooking = !existing && selectedRinkId && selectedSlotId
    ? bookings.find((b) => b.rinkId === selectedRinkId && b.timeSlotId === selectedSlotId)
    : null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">{existing ? 'Edit Booking' : 'New Booking'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Rink + Time Slot */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Rink <span className="text-red-500">*</span></Label>
              <Select value={selectedRinkId?.toString() ?? ''} onValueChange={(v) => setSelectedRinkId(Number(v))} disabled={!!existing}>
                <SelectTrigger className="h-11 text-base"><SelectValue placeholder="Select rink" /></SelectTrigger>
                <SelectContent>
                  {rinks.map((r) => <SelectItem key={r.id} value={r.id.toString()} className="text-base py-2">{r.label ?? `Rink ${r.number}`}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-base font-semibold">Time Slot <span className="text-red-500">*</span></Label>
              <Select value={selectedSlotId?.toString() ?? ''} onValueChange={(v) => setSelectedSlotId(Number(v))} disabled={!!existing}>
                <SelectTrigger className="h-11 text-base"><SelectValue placeholder="Select time" /></SelectTrigger>
                <SelectContent>
                  {timeSlots.map((s) => <SelectItem key={s.id} value={s.id.toString()} className="text-base py-2">{s.startTime}–{s.endTime}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

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
            <Select value={type} onValueChange={(v) => setType(v as BookingType)}>
              <SelectTrigger className="h-11 text-base"><SelectValue placeholder="Select a type…" /></SelectTrigger>
              <SelectContent>
                {BOOKING_TYPES.map((t) => <SelectItem key={t.value} value={t.value} className="text-base py-2">{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Title <span className="text-red-500">*</span></Label>
            <Input className="h-11 text-base" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Club Roll-Up" />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Notes <span className="text-slate-400 font-normal">(optional)</span></Label>
            <Textarea className="text-base" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Any additional details…" />
          </div>

          <Separator />

          {/* Players */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Players</Label>

            {players.length > 0 && (
              <ul className="space-y-1.5 max-h-44 overflow-y-auto">
                {players.map((p, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 min-w-0">
                      <User size={15} className="text-slate-400 dark:text-slate-500 shrink-0" />
                      <span className="truncate text-base font-medium">{p.name}</span>
                      {p.userId
                        ? <Badge variant="secondary" className="text-xs shrink-0">Member</Badge>
                        : <Badge variant="outline" className="text-xs shrink-0">Guest</Badge>
                      }
                    </div>
                    <button onClick={() => removePlayer(i)} className="text-slate-400 dark:text-slate-500 hover:text-red-500 shrink-0 p-1">
                      <X size={16} />
                    </button>
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
                <div className="flex gap-2">
                  <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                    <SelectTrigger className="flex-1 h-11 text-base">
                      <SelectValue placeholder={availableMembers.length ? 'Choose a member…' : 'All members added'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableMembers.map((m) => (
                        <SelectItem key={m.id} value={m.id} className="text-base py-2">
                          {m.name}
                          <span className="text-slate-400 ml-2 text-sm">{m.email}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="h-11 px-4" onClick={addMember} disabled={!selectedMemberId}>
                    <UserPlus size={16} className="mr-1" /> Add
                  </Button>
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

          {error && <p className="text-base text-red-600 font-medium">{error}</p>}
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-between gap-3">
          {existing && canDelete && (
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
              Delete Booking
            </Button>
          )}
          <div className="flex gap-3 ml-auto">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !title.trim() || !type || !!conflictingBooking}>
              {saving && <Loader2 size={16} className="animate-spin mr-2" />}
              {existing ? 'Save Changes' : 'Create Booking'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
