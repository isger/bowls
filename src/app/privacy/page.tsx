import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Notice — Ferndown Bowls Club',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl py-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Privacy Notice</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ferndown Bowls Club · Last updated June 2026</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-base leading-relaxed">

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Who we are</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Ferndown Bowls Club is the data controller for the personal information held in this system.
            We are based at King George V Pavilion, Peter Grant Way, Ferndown, BH22 9EN.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            If you have any questions about how we handle your data, please contact us at{' '}
            <a href="mailto:secretary@ferndownbowlsclub.co.uk" className="text-slate-800 dark:text-slate-200 underline underline-offset-2 hover:opacity-75">
              secretary@ferndownbowlsclub.co.uk
            </a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">What information we hold</h2>
          <p className="text-slate-600 dark:text-slate-400">For club members with an account on this system, we store:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-2">
            <li>Full name</li>
            <li>Email address</li>
            <li>Encrypted password</li>
            <li>Account role (member or administrator)</li>
            <li>Rink booking history (date, rink, booking type)</li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400">
            We do not store payment details, phone numbers, addresses, or any other personal information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Why we hold it and our lawful basis</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We process your personal data on the basis of <strong className="text-slate-700 dark:text-slate-300">legitimate interests</strong> — specifically,
            the administration of club membership and rink booking. This means we need your name and email
            to manage your account, allow you to sign in, and record bookings against your membership.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            We do not use your data for marketing, share it with third parties, or use it for any purpose
            other than running this booking system.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Who can see your information</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Club administrators can see member names and email addresses for the purpose of managing accounts
            and bookings. Your password is stored in encrypted form and cannot be read by anyone, including
            administrators.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            We do not share your information with any third parties. The booking system is hosted securely
            and your data does not leave the UK.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">How long we keep it</h2>
          <p className="text-slate-600 dark:text-slate-400">
            We keep your account and booking history for as long as your club membership is active.
            If you leave the club, your account will be removed within 12 months of your membership ending,
            unless we are required to keep records for longer (for example, for committee or insurance purposes).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Your rights</h2>
          <p className="text-slate-600 dark:text-slate-400">Under UK GDPR you have the right to:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 pl-2">
            <li><strong className="text-slate-700 dark:text-slate-300">Access</strong> — request a copy of the personal data we hold about you</li>
            <li><strong className="text-slate-700 dark:text-slate-300">Correction</strong> — ask us to correct inaccurate information</li>
            <li><strong className="text-slate-700 dark:text-slate-300">Erasure</strong> — ask us to delete your data (subject to any legal obligations)</li>
            <li><strong className="text-slate-700 dark:text-slate-300">Restriction</strong> — ask us to limit how we use your data</li>
            <li><strong className="text-slate-700 dark:text-slate-300">Objection</strong> — object to our processing based on legitimate interests</li>
          </ul>
          <p className="text-slate-600 dark:text-slate-400">
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:secretary@ferndownbowlsclub.co.uk" className="text-slate-800 dark:text-slate-200 underline underline-offset-2 hover:opacity-75">
              secretary@ferndownbowlsclub.co.uk
            </a>.
            We will respond within 30 days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Complaints</h2>
          <p className="text-slate-600 dark:text-slate-400">
            If you are unhappy with how we have handled your personal data, you have the right to complain to
            the Information Commissioner&apos;s Office (ICO) — the UK&apos;s independent data protection authority.
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            ICO website:{' '}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-slate-800 dark:text-slate-200 underline underline-offset-2 hover:opacity-75">
              ico.org.uk
            </a>
            {' '}· Helpline: 0303 123 1113
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Cookies</h2>
          <p className="text-slate-600 dark:text-slate-400">
            This website uses a single session cookie to keep you signed in. It contains no personal
            information and is deleted when you sign out or close your browser. We do not use any
            tracking, advertising, or analytics cookies.
          </p>
        </section>

      </div>

      <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline underline-offset-2">
          ← Back to the diary
        </Link>
      </div>
    </div>
  )
}
