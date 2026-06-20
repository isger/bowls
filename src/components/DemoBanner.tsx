'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export function DemoBanner() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="print:hidden bg-amber-400 text-amber-950 py-2 px-4 flex items-center justify-center gap-3 text-sm font-semibold tracking-wide">
      <span>This is a demo. Data may be reset at any time.</span>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="shrink-0 p-1 rounded hover:bg-amber-500 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}
