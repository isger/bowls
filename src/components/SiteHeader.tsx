import { auth, signOut } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

export async function SiteHeader() {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'

  return (
    <header className="border-b-2 border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main row */}
        <div className="h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image src="/logo.png" alt="Ferndown Bowls Club" width={44} height={44} className="rounded-full" />
            <span className="font-bold text-lg text-slate-800 hidden sm:block">Ferndown Bowls Club</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1 flex-1">
            <Link href="/" className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
              Diary
            </Link>
            {isAdmin && (
              <>
                <Link href="/admin/members" className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                  Members
                </Link>
                <Link href="/admin/rinks" className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                  Rinks
                </Link>
              </>
            )}
          </nav>

          {/* User controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {session?.user ? (
              <>
                <span className="text-base text-slate-700 font-medium hidden md:block">{session.user.name}</span>
                <Badge variant={isAdmin ? 'default' : 'secondary'} className="capitalize text-sm px-2 py-1 hidden sm:inline-flex">
                  {session.user.role}
                </Badge>
                <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }) }}>
                  <Button type="submit" variant="outline" size="sm" className="text-sm sm:text-base sm:h-10">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <Link href="/login">
                <Button>Sign in</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav row */}
        <nav className="sm:hidden flex items-center gap-1 py-2 border-t border-slate-100 overflow-x-auto">
          <Link href="/" className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap">
            Diary
          </Link>
          {isAdmin && (
            <>
              <Link href="/admin/members" className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap">
                Members
              </Link>
              <Link href="/admin/rinks" className="px-4 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap">
                Rinks
              </Link>
            </>
          )}
          {session?.user && (
            <span className="ml-auto px-2 text-sm text-slate-500 whitespace-nowrap">{session.user.name}</span>
          )}
        </nav>
      </div>
    </header>
  )
}
