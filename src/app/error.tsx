'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const today = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-8xl mb-6 select-none" aria-hidden>
        🎳
      </div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        The bowl went in the ditch
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-1 text-lg">
        Something went wrong on our end. The match will carry on shortly.
      </p>
      {error.digest && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-2 font-mono">
          ref: {error.digest}
        </p>
      )}
      <p className="text-sm text-slate-400 dark:text-slate-500 mb-8 font-mono">
        500 Internal server error
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
        >
          Try again
        </button>
        <Link
          href={`/calendar/${today}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
        >
          Back to the diary
        </Link>
      </div>
    </div>
  )
}
