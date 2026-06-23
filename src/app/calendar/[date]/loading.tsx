import { Fragment } from 'react'

export default function CalendarLoading() {
  const RINKS = 6
  const SLOTS = 10

  return (
    <div className="space-y-4">
      {/* Date nav + toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-10 w-24 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-pulse" />
          <div className="h-10 w-52 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-pulse" />
          <div className="h-10 w-20 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-pulse" />
        </div>
        <div className="flex gap-2 sm:ml-auto">
          <div className="h-10 w-36 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-pulse" />
          <div className="h-10 w-32 rounded-md bg-slate-800 dark:bg-slate-200 opacity-20 rounded-md animate-pulse" />
          <div className="h-10 w-20 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-pulse" />
        </div>
      </div>

      {/* Legend */}
      <div className="hidden md:flex gap-6">
        {['Roll Up', 'League', 'Competition', 'Open Play', 'Private'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full opacity-30 animate-pulse ${
              ['bg-violet-600', 'bg-teal-600', 'bg-amber-500', 'bg-emerald-600', 'bg-slate-500'][i]
            }`} />
            <span className="text-sm text-slate-300 dark:text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid: real chrome, shimmer for content */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `70px repeat(${RINKS}, minmax(110px, 1fr))`,
            gridTemplateRows: `auto repeat(${SLOTS}, 72px)`,
            minWidth: '500px',
          }}
        >
          {/* Header: time label */}
          <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Time</span>
          </div>

          {/* Header: rink name shimmers */}
          {Array.from({ length: RINKS }).map((_, i) => (
            <div key={i} className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center">
              <div className="h-3.5 w-10 rounded bg-slate-300 dark:bg-slate-600 animate-pulse" />
            </div>
          ))}

          {/* Rows */}
          {Array.from({ length: SLOTS }).map((_, row) => (
            <Fragment key={row}>
              <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-1.5 flex flex-col items-center justify-center gap-1">
                <div className="h-2.5 w-9 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="h-px w-4 bg-slate-200 dark:bg-slate-700" />
                <div className="h-2.5 w-9 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              </div>

              {Array.from({ length: RINKS }).map((_, col) => {
                const isBooked = (row === 1 && col === 0) || (row === 3 && col === 2) || (row === 6 && col === 4)
                return (
                  <div key={`c-${row}-${col}`} className="border border-slate-200 dark:border-slate-700 p-1.5">
                    {isBooked && (
                      <div className="w-full h-full rounded-md animate-pulse bg-slate-200 dark:bg-slate-700" />
                    )}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
