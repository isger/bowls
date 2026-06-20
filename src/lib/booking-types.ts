import type { BookingType } from './db/schema'

export const BOOKING_TYPE_CONFIG: Record<
  BookingType,
  { label: string; bg: string; text: string; border: string }
> = {
  'roll-up': {
    label: 'Roll Up',
    bg: 'bg-violet-600',
    text: 'text-white',
    border: 'border-violet-700',
  },
  league: {
    label: 'League',
    bg: 'bg-teal-600',
    text: 'text-white',
    border: 'border-teal-700',
  },
  competition: {
    label: 'Competition',
    bg: 'bg-amber-500',
    text: 'text-white',
    border: 'border-amber-600',
  },
  'open-play': {
    label: 'Open Play',
    bg: 'bg-emerald-600',
    text: 'text-white',
    border: 'border-emerald-700',
  },
  private: {
    label: 'Private',
    bg: 'bg-slate-500',
    text: 'text-white',
    border: 'border-slate-600',
  },
}

export const BOOKING_TYPES = Object.entries(BOOKING_TYPE_CONFIG).map(([value, config]) => ({
  value: value as BookingType,
  ...config,
}))
