'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

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
        className="p-3 rounded-md text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full bg-white dark:bg-slate-900 border-b-2 border-slate-200 dark:border-slate-800 shadow-md z-50">
          {userName && (
            <div className="px-5 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
              {userName}
            </div>
          )}
          <nav className="flex flex-col py-2">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="px-5 py-4 text-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100"
            >
              Diary
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/admin/members"
                  onClick={() => setOpen(false)}
                  className="px-5 py-4 text-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100"
                >
                  Members
                </Link>
                <Link
                  href="/admin/rinks"
                  onClick={() => setOpen(false)}
                  className="px-5 py-4 text-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100"
                >
                  Rinks
                </Link>
              </>
            )}
            <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2">
              {isLoggedIn ? (
                <Link
                  href="/api/auth/signout"
                  onClick={() => setOpen(false)}
                  className="px-5 py-4 text-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 block"
                >
                  Sign out
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="px-5 py-4 text-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100 block"
                >
                  Sign in
                </Link>
              )}
              <div className="px-3 py-1 flex items-center gap-3 text-base font-medium text-slate-700 dark:text-slate-300">
                <ThemeToggle />
                <span>Toggle theme</span>
              </div>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
