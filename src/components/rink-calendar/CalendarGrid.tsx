import React from 'react'
import type { BookingWithPlayers, Rink, TimeSlot } from '@/lib/db/schema'
import { BookingCell } from './BookingCell'

function parseTime(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

const UNIT_PX = 36 // pixels per base time unit

interface Props {
  rinks: Rink[]
  timeSlots: TimeSlot[]
  bookings: BookingWithPlayers[]
  canCreate: boolean
  canEditBooking: (booking: BookingWithPlayers) => boolean
  showPlayers: boolean
  onCellClick: (rinkId: number, timeSlotId: number, existing?: BookingWithPlayers) => void
}

export function CalendarGrid({ rinks, timeSlots, bookings, canCreate, canEditBooking, showPlayers, onCellClick }: Props) {
  if (timeSlots.length === 0) return null

  // Derive the smallest time unit from all slot durations and start-time offsets
  const allMins = timeSlots.flatMap(s => [parseTime(s.startTime), parseTime(s.endTime)])
  const dayStart = Math.min(...allMins)
  const dayEnd   = Math.max(...allMins)

  const candidates = timeSlots.flatMap(s => {
    const dur = parseTime(s.endTime) - parseTime(s.startTime)
    const off = parseTime(s.startTime) - dayStart
    return off > 0 ? [dur, off] : [dur]
  })
  const baseUnit    = candidates.reduce((a, b) => gcd(a, b))
  const totalRows   = (dayEnd - dayStart) / baseUnit
  const unitsPerHour = 60 / baseUnit

  // CSS grid row index for a given time in minutes (row 1 = header row)
  const toRow = (mins: number) => (mins - dayStart) / baseUnit + 2

  // Hour labels for the time axis
  const hourMarks: { label: string; row: number }[] = []
  for (let t = Math.ceil(dayStart / 60) * 60; t < dayEnd; t += 60) {
    hourMarks.push({
      label: `${String(t / 60 | 0).padStart(2, '0')}:00`,
      row: toRow(t),
    })
  }

  // Booking lookups
  const bookingMap = new Map<string, BookingWithPlayers>()
  for (const b of bookings) bookingMap.set(`${b.rinkId}-${b.timeSlotId}`, b)

  const coveredCells = new Set<string>()
  for (const b of bookings) {
    const dur = b.durationSlots ?? 1
    const si = timeSlots.findIndex(s => s.id === b.timeSlotId)
    if (si === -1) continue
    const lastSlot = timeSlots[Math.min(si + dur - 1, timeSlots.length - 1)]
    const bStart = parseTime(timeSlots[si].startTime)
    const bEnd   = parseTime(lastSlot.endTime)
    for (const slot of timeSlots) {
      if (slot.id === b.timeSlotId) continue
      const sStart = parseTime(slot.startTime)
      const sEnd   = parseTime(slot.endTime)
      if (sStart < bEnd && sEnd > bStart) {
        coveredCells.add(`${b.rinkId}-${slot.id}`)
      }
    }
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="grid print:min-w-0"
        style={{
          gridTemplateColumns: `70px repeat(${rinks.length}, minmax(110px, 1fr))`,
          gridTemplateRows: `auto repeat(${totalRows}, ${UNIT_PX}px)`,
          minWidth: rinks.length > 1 ? '500px' : 'auto',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div
          style={{ gridColumn: 1, gridRow: 1 }}
          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center justify-center"
        >
          Time
        </div>
        {rinks.map((rink, ci) => (
          <div
            key={rink.id}
            style={{ gridColumn: ci + 2, gridRow: 1 }}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-sm font-bold text-slate-700 dark:text-slate-200 text-center"
          >
            {rink.label ?? `Rink ${rink.number}`}
          </div>
        ))}

        {/* ── Time column background ─────────────────────────────── */}
        <div
          style={{ gridColumn: 1, gridRow: `2 / span ${totalRows}` }}
          className="bg-slate-50 dark:bg-slate-800/50 border-l border-r border-b border-slate-200 dark:border-slate-700"
        />

        {/* ── Hour labels (float above background) ──────────────── */}
        {hourMarks.map(({ label, row }) => (
          <div
            key={label}
            style={{ gridColumn: 1, gridRow: row, zIndex: 1 }}
            className="flex items-center justify-center border-t border-slate-200 dark:border-slate-700 pointer-events-none"
          >
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-none">
              {label}
            </span>
          </div>
        ))}

        {/* ── Background grid lines for rink columns ────────────── */}
        {Array.from({ length: totalRows }, (_, i) =>
          rinks.map((_, ci) => (
            <div
              key={`bg-${i}-${ci}`}
              style={{ gridColumn: ci + 2, gridRow: i + 2 }}
              className={`border-l border-slate-200 dark:border-slate-700 ${
                i % unitsPerHour === 0 ? 'border-t' : ''
              }`}
            />
          ))
        )}

        {/* ── Slot cells: bookings + empty clickable areas ────────── */}
        {timeSlots.map(slot => {
          const slotStartMins = parseTime(slot.startTime)
          const slotEndMins   = parseTime(slot.endTime)
          const slotRow  = toRow(slotStartMins)
          const slotSpan = (slotEndMins - slotStartMins) / baseUnit

          return rinks.map((rink, ci) => {
            const key = `${rink.id}-${slot.id}`
            if (coveredCells.has(key)) return null

            const booking = bookingMap.get(key)
            const editable = booking ? canEditBooking(booking) : false

            // Span the booking across its full duration in time units
            let rowSpan = slotSpan
            if (booking) {
              const dur = booking.durationSlots ?? 1
              if (dur > 1) {
                const si = timeSlots.findIndex(s => s.id === slot.id)
                const lastSlot = timeSlots[si + dur - 1]
                if (lastSlot) {
                  rowSpan = (parseTime(lastSlot.endTime) - slotStartMins) / baseUnit
                }
              }
            }

            return (
              <div
                key={`cell-${rink.id}-${slot.id}`}
                style={{ gridColumn: ci + 2, gridRow: `${slotRow} / span ${rowSpan}`, zIndex: 2 }}
                className="p-1 print:min-h-0"
              >
                {booking ? (
                  <BookingCell
                    booking={booking}
                    canEdit={editable}
                    showPlayers={showPlayers}
                    onClick={() => onCellClick(rink.id, slot.id, booking)}
                  />
                ) : canCreate ? (
                  <button
                    onClick={() => onCellClick(rink.id, slot.id)}
                    className="print:hidden w-full h-full rounded border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-slate-500 dark:hover:border-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center text-xs font-medium text-center px-1"
                  >
                    + Book
                  </button>
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            )
          })
        })}
      </div>
    </div>
  )
}
