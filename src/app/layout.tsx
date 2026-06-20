import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/SiteHeader'
import { DemoBanner } from '@/components/DemoBanner'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ferndown Bowls Club',
  description: 'Rink booking and club management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className}>
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <DemoBanner />
        <SiteHeader />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
