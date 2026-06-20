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
        'group relative w-full h-full min-h-[90px] rounded p-3 text-left transition-opacity',
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
        <span className="hidden print:block text-xs mt-2 opacity-90 leading-snug font-medium">
          {booking.players.map((p) => p.name).join(', ')}
        </span>
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
        className="p-0 max-w-[220px] bg-white text-slate-800 border border-slate-200 shadow-lg rounded-lg overflow-hidden"
      >
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <Users size={14} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-700">
            {playerCount} {playerCount === 1 ? 'player' : 'players'}
          </span>
        </div>
        <ul className="py-1 max-h-60 overflow-y-auto">
          {booking.players.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2">
              <span className="text-sm text-slate-800 font-medium">{p.name}</span>
              <span className={cn(
                'text-xs shrink-0 font-medium',
                p.userId ? 'text-slate-500' : 'text-slate-400'
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
