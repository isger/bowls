'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

interface Props {
  isAdmin: boolean
  isLoggedIn: boolean
  userName?: string
}

export function MobileNav({ isAdmin, isLoggedIn, userName }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full bg-white border-b-2 border-slate-200 shadow-md z-50">
          {userName && (
            <div className="px-5 py-3 text-sm font-medium text-slate-500 border-b border-slate-100">
              {userName}
            </div>
          )}
          <nav className="flex flex-col py-2">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="px-5 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
            >
              Diary
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/admin/members"
                  onClick={() => setOpen(false)}
                  className="px-5 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                >
                  Members
                </Link>
                <Link
                  href="/admin/rinks"
                  onClick={() => setOpen(false)}
                  className="px-5 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                >
                  Rinks
                </Link>
              </>
            )}
            <div className="border-t border-slate-100 mt-2 pt-2">
              {isLoggedIn ? (
                <Link
                  href="/api/auth/signout"
                  onClick={() => setOpen(false)}
                  className="px-5 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 block"
                >
                  Sign out
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="px-5 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 block"
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
