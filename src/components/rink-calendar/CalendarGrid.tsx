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
  const bookingMap = new Map<string, BookingWithPlayers>()
  for (const b of bookings) {
    bookingMap.set(`${b.rinkId}-${b.timeSlotId}`, b)
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="grid print:min-w-0"
        style={{
          gridTemplateColumns: `70px repeat(${rinks.length}, minmax(110px, 1fr))`,
          minWidth: rinks.length > 1 ? '500px' : 'auto',
        }}
      >
        {/* Header row */}
        <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide flex items-center justify-center">
          Time
        </div>
        {rinks.map((rink) => (
          <div
            key={rink.id}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 text-sm font-bold text-slate-700 dark:text-slate-200 text-center"
          >
            {rink.label ?? `Rink ${rink.number}`}
          </div>
        ))}

        {/* Time slot rows */}
        {timeSlots.map((slot) => (
          <React.Fragment key={slot.id}>
            <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-1.5 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{slot.startTime}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">–</span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{slot.endTime}</span>
            </div>
            {rinks.map((rink) => {
              const booking = bookingMap.get(`${rink.id}-${slot.id}`)
              const editable = booking ? canEditBooking(booking) : false
              return (
                <div
                  key={`cell-${rink.id}-${slot.id}`}
                  className="border border-slate-200 dark:border-slate-700 p-1.5 min-h-[90px] print:min-h-0"
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
                      className="print:hidden w-full h-full min-h-[90px] rounded border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-slate-500 dark:hover:border-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center text-xs font-medium text-center px-1"
                    >
                      + Book
                    </button>
                  ) : (
                    <div className="w-full h-full min-h-[90px]" />
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
