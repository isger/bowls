import Link from 'next/link'
import { format } from 'date-fns'

export default function NotFound() {
  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-8xl mb-6 select-none" aria-hidden>
        🎳
      </div>
      <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        Wrong end of the green
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-1 text-lg">
        That page doesn&apos;t exist. Looks like this jack got away from us.
      </p>
      <p className="text-sm text-slate-400 dark:text-slate-500 mb-8 font-mono">
        404 Page not found
      </p>
      <Link
        href={`/calendar/${today}`}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
      >
        Back to the diary
      </Link>
    </div>
  )
}
