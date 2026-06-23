export default function MembersLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="h-3.5 w-48 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-md bg-slate-800 dark:bg-slate-200 opacity-20 animate-pulse" />
      </div>

      {/* Search + action bar */}
      <div className="flex gap-3">
        <div className="h-10 flex-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-pulse" />
        <div className="h-10 w-24 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-pulse" />
        <div className="h-10 w-24 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-pulse" />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          {['Name', 'Email', 'Role', ''].map((label, i) => (
            <span key={i} className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</span>
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`grid grid-cols-4 gap-4 items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 last:border-0 ${
              i % 2 === 0 ? '' : 'bg-slate-50/50 dark:bg-slate-800/30'
            }`}
          >
            <div className="h-3.5 w-28 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
            <div className="h-3.5 w-36 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-3.5 w-12 rounded bg-slate-100 dark:bg-slate-800 animate-pulse ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}
