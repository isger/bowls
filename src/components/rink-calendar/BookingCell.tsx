'use client'

import { cn } from '@/lib/utils'
import { BOOKING_TYPE_CONFIG } from '@/lib/booking-types'
import type { BookingWithPlayers } from '@/lib/db/schema'
import { Pencil, Users } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const MAX_INLINE = 4

interface Props {
  booking: BookingWithPlayers
  canEdit: boolean
  showPlayers: boolean
  onClick: () => void
}

export function BookingCell({ booking, canEdit, showPlayers, onClick }: Props) {
  const config = BOOKING_TYPE_CONFIG[booking.type]
  const playerCount = booking.players.length
  const duration = booking.durationSlots ?? 1
  const showInline = playerCount > 0 && duration >= 2

  const sharedClasses = cn(
    'group relative w-full h-full min-h-[90px] print:min-h-0 rounded p-3 text-left transition-opacity',
    config.bg,
    config.text,
    canEdit ? 'cursor-pointer hover:opacity-90' : 'cursor-default'
  )

  const header = (
    <>
      <span className="block text-sm font-bold leading-tight line-clamp-2">{booking.title}</span>
      <span className="block text-xs mt-1 opacity-80 font-medium">{config.label}</span>
      {booking.notes && (
        <span className="block text-xs mt-1 opacity-75 leading-snug line-clamp-2">{booking.notes}</span>
      )}
    </>
  )

  const printPlayers = (
    <div className="hidden print:block mt-2 rounded overflow-hidden border border-white/30">
      {booking.players.map((p, i) => (
        <div key={p.id} className={`flex items-center gap-1.5 px-1.5 py-[3px] ${i % 2 === 0 ? 'bg-white/90' : 'bg-white/60'}`}>
          <span className="text-[8px] font-bold text-slate-400 w-3 shrink-0 tabular-nums">{i + 1}</span>
          <span className="text-[10px] font-semibold text-slate-800 leading-tight">{p.name}</span>
        </div>
      ))}
    </div>
  )

  // Large booking: inline player list
  if (showInline) {
    const inlinePlayers = booking.players.slice(0, MAX_INLINE)
    const overflowPlayers = booking.players.slice(MAX_INLINE)

    return (
      <div
        onClick={canEdit ? onClick : undefined}
        role={canEdit ? 'button' : undefined}
        tabIndex={canEdit ? 0 : undefined}
        onKeyDown={canEdit ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
        className={sharedClasses}
      >
        {header}

        {/* Inline list screen only */}
        <div className="print:hidden mt-2 rounded overflow-hidden border border-white/30">
          {inlinePlayers.map((p, i) => (
            <div key={p.id} className={`flex items-center gap-1.5 px-1.5 py-0.5 ${i % 2 === 0 ? 'bg-white/90' : 'bg-white/60'}`}>
              <span className="text-[9px] font-bold text-slate-400 w-3 shrink-0 tabular-nums">{i + 1}</span>
              <span className="text-[10px] font-semibold text-slate-800 leading-tight">{p.name}</span>
            </div>
          ))}
          {overflowPlayers.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-center text-[9px] font-bold py-0.5 bg-white/40 hover:bg-white/60 text-slate-600 transition-colors"
                >
                  +{overflowPlayers.length} more
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="p-0 max-w-[220px] bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-lg rounded-lg overflow-hidden"
              >
                <ul className="py-1">
                  {overflowPlayers.map((p, i) => (
                    <li key={p.id} className={`flex items-center gap-3 px-4 py-2 ${(i + MAX_INLINE) % 2 === 0 ? '' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                      <span className="text-xs text-slate-400 dark:text-slate-500 w-4 shrink-0 tabular-nums font-medium">{MAX_INLINE + i + 1}</span>
                      <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">{p.name}</span>
                    </li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Print: all players */}
        {printPlayers}

        {canEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onClick() }}
            className="print:hidden absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>
    )
  }

  // Small booking: existing button + hover tooltip
  const cell = (
    <button
      onClick={canEdit ? onClick : undefined}
      className={sharedClasses}
    >
      {header}
      {playerCount > 0 && (
        <span className="print:hidden flex items-center gap-1.5 text-xs mt-2 opacity-90 font-medium">
          <Users size={12} />
          {playerCount} {playerCount === 1 ? 'player' : 'players'}
        </span>
      )}
      {playerCount > 0 && printPlayers}
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
