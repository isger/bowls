'use client'

import type { BookingWithPlayers, Rink, TimeSlot } from '@/lib/db/schema'
import { useMemo, useState } from 'react'
import { CalendarGrid } from './CalendarGrid'
import { BookingModal } from './BookingModal'
import { DateNav } from './DateNav'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TooltipProvider } from '@/components/ui/tooltip'
import { BOOKING_TYPE_CONFIG } from '@/lib/booking-types'
import { Plus, Printer, SlidersHorizontal, X } from 'lucide-react'

interface Props {
  date: string
  rinks: Rink[]
  timeSlots: TimeSlot[]
  initialBookings: BookingWithPlayers[]
  userRole: string
  userId: string | null
}

interface ModalState {
  open: boolean
  rinkId: number | null
  timeSlotId: number | null
  existing?: BookingWithPlayers
}

function playerKey(userId: string | null, name: string) {
  return userId ? `m:${userId}` : `g:${name}`
}

export function RinkCalendar({ date, rinks, timeSlots, initialBookings, userRole, userId }: Props) {
  const canCreate = userRole === 'admin' || userRole === 'member'
  const canDelete = userRole === 'admin'
  const showPlayers = userRole === 'admin' || userRole === 'member'
  const canEditBooking = (b: BookingWithPlayers) =>
    userRole === 'admin' || (userRole === 'member' && b.createdBy === userId)
  const [bookings, setBookings] = useState<BookingWithPlayers[]>(initialBookings)
  const [modal, setModal] = useState<ModalState>({ open: false, rinkId: null, timeSlotId: null })
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedRinkId, setSelectedRinkId] = useState<number | null>(null)

  const allPlayers = useMemo(() => {
    const map = new Map<string, { key: string; name: string; isMember: boolean }>()
    for (const b of bookings) {
      for (const p of b.players) {
        const key = playerKey(p.userId, p.name)
        if (!map.has(key)) map.set(key, { key, name: p.name, isMember: !!p.userId })
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
  }, [bookings])

  const filteredBookings = useMemo(() => {
    if (activeFilters.size === 0) return bookings
    return bookings.filter((b) =>
      b.players.some((p) => activeFilters.has(playerKey(p.userId, p.name)))
    )
  }, [bookings, activeFilters])

  const visiblePlayers = search.trim()
    ? allPlayers.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : allPlayers

  function toggleFilter(key: string) {
    setActiveFilters((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  function clearFilters() {
    setActiveFilters(new Set())
    setSearch('')
  }

  function openModal(rinkId: number | null = null, timeSlotId: number | null = null, existing?: BookingWithPlayers) {
    setModal({ open: true, rinkId, timeSlotId, existing })
  }

  function closeModal() {
    setModal((m) => ({ ...m, open: false }))
  }

  function handleSave(booking: BookingWithPlayers) {
    setBookings((prev) => [...prev.filter((b) => b.id !== booking.id), booking])
    closeModal()
  }

  function handleDelete(id: number) {
    setBookings((prev) => prev.filter((b) => b.id !== id))
    closeModal()
  }

  const activeFilterPlayers = allPlayers.filter((p) => activeFilters.has(p.key))

  const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <TooltipProvider delayDuration={300}>
    <div className="space-y-4">
      {/* Print-only header */}
      <div className="hidden print:block mb-2">
        <h1 className="text-2xl font-bold text-slate-800">Ferndown Bowls Club</h1>
        <p className="text-lg text-slate-600 mt-0.5">Rink Bookings — {formattedDate}</p>
        <div className="flex flex-wrap items-center gap-4 mt-2 pt-2 border-t border-slate-200">
          {Object.entries(BOOKING_TYPE_CONFIG).map(([type, config]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 rounded ${config.bg}`} />
              <span className="text-sm text-slate-600">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Header row — hidden in print */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center gap-3">
        <DateNav date={date} />
        <div className="flex items-center gap-2 sm:ml-auto">
          {/* Player filter */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={activeFilters.size > 0 ? 'default' : 'outline'}
                className="gap-2"
              >
                <SlidersHorizontal size={16} />
                Filter by Player
                {activeFilters.size > 0 && (
                  <span className="ml-0.5 rounded-full bg-white/20 px-1.5 text-xs font-semibold">
                    {activeFilters.size}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="end">
              <div className="p-3 border-b border-slate-100">
                <input
                  autoFocus
                  placeholder="Search players…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-base px-3 py-2 rounded border border-slate-200 outline-none focus:border-slate-400"
                />
              </div>
              <ul className="max-h-64 overflow-y-auto py-1">
                {allPlayers.length === 0 ? (
                  <li className="px-4 py-5 text-base text-slate-400 text-center">
                    No players on this day
                  </li>
                ) : visiblePlayers.length === 0 ? (
                  <li className="px-4 py-3 text-base text-slate-400">No players found</li>
                ) : (
                  visiblePlayers.map((p) => {
                    const checked = activeFilters.has(p.key)
                    return (
                      <li key={p.key}>
                        <button
                          onClick={() => toggleFilter(p.key)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-base hover:bg-slate-50 text-left"
                        >
                          <span className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${checked ? 'bg-slate-800 border-slate-800' : 'border-slate-300'}`}>
                            {checked && <svg width="11" height="9" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </span>
                          <span className="flex-1 truncate font-medium">{p.name}</span>
                          {p.isMember && <span className="text-sm text-slate-400 shrink-0">Member</span>}
                        </button>
                      </li>
                    )
                  })
                )}
              </ul>
              {activeFilters.size > 0 && (
                <div className="p-3 border-t border-slate-100">
                  <button onClick={clearFilters} className="w-full text-sm font-medium text-slate-500 hover:text-slate-700 py-1">
                    Clear all filters
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {canCreate && (
            <Button onClick={() => openModal()}>
              <Plus size={18} className="mr-2" />
              New Booking
            </Button>
          )}
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer size={16} />
            Print
          </Button>
        </div>
      </div>

      {/* Legend row — hidden on mobile and in print */}
      <div className="hidden md:flex print:hidden items-center gap-x-6 gap-y-1.5 flex-wrap -mt-1">
        {Object.entries(BOOKING_TYPE_CONFIG).map(([type, config]) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full shrink-0 ${config.bg} opacity-70`} />
            <span className="text-sm text-slate-500">{config.label}</span>
          </div>
        ))}
      </div>

      {/* Active filter chips — hidden in print */}
      {activeFilterPlayers.length > 0 && (
        <div className="print:hidden flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-500">Showing:</span>
          {activeFilterPlayers.map((p) => (
            <button
              key={p.key}
              onClick={() => toggleFilter(p.key)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
            >
              {p.name}
              <X size={13} className="opacity-70" />
            </button>
          ))}
          <button onClick={clearFilters} className="text-sm text-slate-400 hover:text-slate-600 underline">
            Clear
          </button>
        </div>
      )}

      {/* Rink filter — mobile only */}
      <div className="sm:hidden flex gap-2 overflow-x-auto pb-1 print:hidden">
        <button
          onClick={() => setSelectedRinkId(null)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedRinkId === null
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 active:bg-slate-200'
          }`}
        >
          All rinks
        </button>
        {rinks.map((rink) => (
          <button
            key={rink.id}
            onClick={() => setSelectedRinkId(rink.id)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedRinkId === rink.id
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 active:bg-slate-200'
            }`}
          >
            {rink.label ?? `Rink ${rink.number}`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <CalendarGrid
          rinks={selectedRinkId ? rinks.filter((r) => r.id === selectedRinkId) : rinks}
          timeSlots={timeSlots}
          bookings={filteredBookings}
          canCreate={canCreate}
          canEditBooking={canEditBooking}
          showPlayers={showPlayers}
          onCellClick={openModal}
        />
      </div>

      {canCreate && (
        <BookingModal
          open={modal.open}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
          date={date}
          rinkId={modal.rinkId}
          timeSlotId={modal.timeSlotId}
          existing={modal.existing}
          rinks={rinks}
          timeSlots={timeSlots}
          bookings={bookings}
          canDelete={canDelete}
        />
      )}
    </div>
    </TooltipProvider>
  )
}
