import { auth, signOut } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MobileNav } from '@/components/MobileNav'
import { ThemeToggle } from '@/components/ThemeToggle'
import Image from 'next/image'
import Link from 'next/link'

export async function SiteHeader() {
  const session = await auth()
  const isAdmin = session?.user?.role === 'admin'

  return (
    <header className="print:hidden border-b-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image src="/logo.png" alt="Ferndown Bowls Club" width={44} height={44} className="rounded-full" />
            <span className="font-bold text-lg text-slate-800 dark:text-slate-100">Ferndown Bowls Club</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1 flex-1">
            <Link href="/" className="px-4 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
              Diary
            </Link>
            {isAdmin && (
              <>
                <Link href="/admin/members" className="px-4 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                  Members
                </Link>
                <Link href="/admin/config" className="px-4 py-2 text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                  Configuration
                </Link>
              </>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle />
            {session?.user ? (
              <>
                <span className="text-base text-slate-700 dark:text-slate-300 font-medium hidden md:block">{session.user.name}</span>
                <Badge variant={isAdmin ? 'default' : 'secondary'} className="capitalize text-sm px-2 py-1 hidden sm:inline-flex">
                  {session.user.role}
                </Badge>
                <form action={async () => { 'use server'; await signOut({ redirectTo: '/' }) }}>
                  <Button type="submit" variant="outline" size="sm" className="hidden sm:inline-flex">
                    Sign out
                  </Button>
                </form>
              </>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button>Sign in</Button>
              </Link>
            )}

            {/* Hamburger — mobile only */}
            <MobileNav
              isAdmin={isAdmin}
              isLoggedIn={!!session?.user}
              userName={session?.user?.name ?? undefined}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
