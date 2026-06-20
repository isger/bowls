import React from 'react'
import type { BookingWithPlayers, Rink, TimeSlot } from '@/lib/db/schema'
import { BookingCell } from './BookingCell'

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
  // Map start slot → booking
  const bookingMap = new Map<string, BookingWithPlayers>()
  for (const b of bookings) {
    bookingMap.set(`${b.rinkId}-${b.timeSlotId}`, b)
  }

  // Cells that are covered by a spanning booking (not the start cell)
  const coveredCells = new Set<string>()
  for (const b of bookings) {
    const duration = b.durationSlots ?? 1
    if (duration <= 1) continue
    const startIdx = timeSlots.findIndex((s) => s.id === b.timeSlotId)
    if (startIdx === -1) continue
    for (let i = 1; i < duration; i++) {
      const slot = timeSlots[startIdx + i]
      if (slot) coveredCells.add(`${b.rinkId}-${slot.id}`)
    }
  }

  const colCount = rinks.length + 1 // time label col + rink cols

  return (
    <div className="overflow-x-auto">
      <div
        className="grid print:min-w-0"
        style={{
          gridTemplateColumns: `70px repeat(${rinks.length}, minmax(110px, 1fr))`,
          gridTemplateRows: `auto repeat(${timeSlots.length}, minmax(72px, auto))`,
          minWidth: rinks.length > 1 ? '500px' : 'auto',
        }}
      >
        {/* Header: Time label */}
        <div
          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center justify-center"
          style={{ gridColumn: 1, gridRow: 1 }}
        >
          Time
        </div>

        {/* Header: Rink labels */}
        {rinks.map((rink, colIdx) => (
          <div
            key={rink.id}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-sm font-bold text-slate-700 dark:text-slate-200 text-center"
            style={{ gridColumn: colIdx + 2, gridRow: 1 }}
          >
            {rink.label ?? `Rink ${rink.number}`}
          </div>
        ))}

        {/* Time slot rows */}
        {timeSlots.map((slot, rowIdx) => (
          <React.Fragment key={slot.id}>
            {/* Time label */}
            <div
              className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-1.5 flex flex-col items-center justify-center text-center"
              style={{ gridColumn: 1, gridRow: rowIdx + 2 }}
            >
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{slot.startTime}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">–</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{slot.endTime}</span>
            </div>

            {/* Rink cells */}
            {rinks.map((rink, colIdx) => {
              const key = `${rink.id}-${slot.id}`

              // Skip cells covered by a spanning booking above
              if (coveredCells.has(key)) return null

              const booking = bookingMap.get(key)
              const editable = booking ? canEditBooking(booking) : false
              const span = booking?.durationSlots ?? 1

              return (
                <div
                  key={`cell-${rink.id}-${slot.id}`}
                  className="border border-slate-200 dark:border-slate-700 p-1.5 print:min-h-0"
                  style={{
                    gridColumn: colIdx + 2,
                    gridRow: `${rowIdx + 2} / span ${span}`,
                  }}
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
                      className="print:hidden w-full h-full min-h-[72px] rounded border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-slate-500 dark:hover:border-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center text-xs font-medium text-center px-1"
                    >
                      + Book
                    </button>
                  ) : (
                    <div className="w-full h-full min-h-[72px]" />
                  )}
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
