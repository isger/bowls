export default function ConfigLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="h-5 w-28 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <div className="h-3.5 w-40 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* Rinks card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-3 w-44 rounded bg-slate-100 dark:bg-slate-800 animate-pulse mt-1.5" />
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3">
                <div className="h-3.5 w-14 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="flex items-center gap-2.5">
                  <div className="h-3 w-10 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  <div className="h-5 w-9 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="h-3 w-16 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="flex gap-2">
              <div className="h-9 w-16 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse" />
              <div className="h-9 flex-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse" />
              <div className="h-9 w-9 rounded-md bg-slate-800 dark:bg-slate-200 opacity-20 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Time slots card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-3 w-52 rounded bg-slate-100 dark:bg-slate-800 animate-pulse mt-1.5" />
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-2.5">
                  <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" style={{ fontVariantNumeric: 'tabular-nums' }} />
                  <div className="h-4 w-4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </div>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="h-9 flex-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse" />
                <div className="h-3.5 w-3 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-9 flex-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 animate-pulse" />
                <div className="h-9 w-9 rounded-md bg-slate-800 dark:bg-slate-200 opacity-20 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Durations card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-3 w-52 rounded bg-slate-100 dark:bg-slate-800 animate-pulse mt-1.5" />
            </div>
            <div className="px-5 py-4 flex flex-wrap gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-9 w-12 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
