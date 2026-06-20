import { auth } from '@/lib/auth'
import { getActiveRinks, getBookingsForDate, getTimeSlots } from '@/lib/db/queries'
import { RinkCalendar } from '@/components/rink-calendar/RinkCalendar'
import { isValid, parseISO } from 'date-fns'
import { notFound } from 'next/navigation'

export default async function CalendarPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !isValid(parseISO(date))) {
    notFound()
  }

  const [session, rinks, timeSlots, bookings] = await Promise.all([
    auth(),
    getActiveRinks(),
    getTimeSlots(),
    getBookingsForDate(date),
  ])

  const userRole = session?.user?.role ?? 'guest'
  const userId = session?.user?.id ?? null

  return (
    <div className="space-y-4">
      {rinks.length === 0 ? (
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center text-slate-500">
          No active rinks configured.{' '}
          {userRole === 'admin' && <a href="/admin/rinks" className="underline">Add rinks</a>}
        </div>
      ) : (
        <RinkCalendar
          date={date}
          rinks={rinks}
          timeSlots={timeSlots}
          initialBookings={bookings}
          userRole={userRole}
          userId={userId}
        />
      )}

    </div>
  )
}
