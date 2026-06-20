import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { DemoBanner } from '@/components/DemoBanner'
import { ThemeProvider } from '@/components/ThemeProvider'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ferndown Bowls Club',
  description: 'Rink booking and club management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className} suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen flex flex-col">
        <ThemeProvider>
          <DemoBanner />
          <SiteHeader />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <footer className="print:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-500 dark:text-slate-400">
              <span>&copy; {new Date().getFullYear()} Ferndown Bowls Club. All rights reserved.</span>
              <span>Rink booking &amp; club management</span>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
