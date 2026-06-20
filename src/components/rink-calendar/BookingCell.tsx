'use client'

import { cn } from '@/lib/utils'
import { BOOKING_TYPE_CONFIG } from '@/lib/booking-types'
import type { BookingWithPlayers } from '@/lib/db/schema'
import { Pencil, Users } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface Props {
  booking: BookingWithPlayers
  canEdit: boolean
  showPlayers: boolean
  onClick: () => void
}

export function BookingCell({ booking, canEdit, showPlayers, onClick }: Props) {
  const config = BOOKING_TYPE_CONFIG[booking.type]
  const playerCount = booking.players.length

  const cell = (
    <button
      onClick={canEdit ? onClick : undefined}
      className={cn(
        'group relative w-full h-full min-h-[90px] print:min-h-0 rounded p-3 text-left transition-opacity',
        config.bg,
        config.text,
        canEdit ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
      )}
    >
      <span className="block text-sm font-bold leading-tight line-clamp-2">
        {booking.title}
      </span>
      <span className="block text-xs mt-1 opacity-80 font-medium">{config.label}</span>
      {booking.notes && (
        <span className="block text-xs mt-1 opacity-75 leading-snug line-clamp-2">
          {booking.notes}
        </span>
      )}
      {playerCount > 0 && (
        <span className="print:hidden flex items-center gap-1.5 text-xs mt-2 opacity-90 font-medium">
          <Users size={12} />
          {playerCount} {playerCount === 1 ? 'player' : 'players'}
        </span>
      )}
      {playerCount > 0 && (
        <div className="hidden print:block mt-2 rounded overflow-hidden border border-white/30">
          {booking.players.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-1.5 px-1.5 py-[3px] ${i % 2 === 0 ? 'bg-white/90' : 'bg-white/60'}`}
            >
              <span className="text-[8px] font-bold text-slate-400 w-3 shrink-0 tabular-nums">{i + 1}</span>
              <span className="text-[10px] font-semibold text-slate-800 leading-tight">{p.name}</span>
            </div>
          ))}
        </div>
      )}
      {canEdit && (
        <span className="print:hidden absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Pencil size={14} />
        </span>
      )}
    </button>
  )

  if (!showPlayers || playerCount === 0) return cell

  return (
    <Tooltip>
      <TooltipTrigger asChild>{cell}</TooltipTrigger>
      <TooltipContent
        side="right"
        className="p-0 max-w-[220px] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <Users size={14} className="text-slate-400 dark:text-slate-500" />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {playerCount} {playerCount === 1 ? 'player' : 'players'}
          </span>
        </div>
        <ul className="py-1 max-h-60 overflow-y-auto">
          {booking.players.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2">
              <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">{p.name}</span>
              <span className={cn(
                'text-xs shrink-0 font-medium',
                p.userId ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'
              )}>
                {p.userId ? 'Member' : 'Guest'}
              </span>
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  )
}
