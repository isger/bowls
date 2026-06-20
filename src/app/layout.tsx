import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { DemoBanner } from '@/components/DemoBanner'
import { ThemeProvider } from '@/components/ThemeProvider'
import { MapPin, ExternalLink } from 'lucide-react'

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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                  <address className="not-italic text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Ferndown Bowls Club</span><br />
                    King George V Pavilion<br />
                    Peter Grant Way<br />
                    Ferndown<br />
                    BH22 9EN
                  </address>
                </div>

                {/* Get Directions */}
                <a
                  href="https://maps.google.com/?q=Ferndown+Bowls+Club,+King+George+V+Pavilion,+Peter+Grant+Way,+Ferndown,+BH22+9EN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <MapPin size={15} className="text-slate-500 dark:text-slate-400" />
                  Get Directions
                  <ExternalLink size={13} className="text-slate-400 dark:text-slate-500" />
                </a>
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 text-center sm:text-left">
                &copy; {new Date().getFullYear()} Ferndown Bowls Club. All rights reserved.
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
