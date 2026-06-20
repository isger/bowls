import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bookingPlayers, bookings } from '@/lib/db/schema'
import { checkBookingConflict, getBookingsForDate } from '@/lib/db/queries'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const playerSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(1).max(100),
})

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rinkId: z.number().int().positive(),
  timeSlotId: z.number().int().positive(),
  durationSlots: z.number().int().min(1).max(3).default(1),
  type: z.enum(['roll-up', 'competition', 'league', 'open-play', 'private']),
  title: z.string().min(1).max(100),
  notes: z.string().max(500).optional(),
  players: z.array(playerSchema).optional(),
})

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }
  const data = await getBookingsForDate(date)
  return NextResponse.json({ bookings: data })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const role = session?.user?.role
  if (role !== 'admin' && role !== 'member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { date, rinkId, timeSlotId, durationSlots, type, title, notes, players } = parsed.data

  const conflict = await checkBookingConflict(date, rinkId, timeSlotId, durationSlots)
  if (conflict) {
    return NextResponse.json({ error: 'That rink and time slot is already booked' }, { status: 409 })
  }

  const createdBy = session?.user?.id
  if (!createdBy) {
    return NextResponse.json({ error: 'Session missing user ID' }, { status: 500 })
  }

  try {
    const [booking] = await db
      .insert(bookings)
      .values({ date, rinkId, timeSlotId, durationSlots, type, title, notes, createdBy })
      .returning()

    const savedPlayers = players?.length
      ? await db
          .insert(bookingPlayers)
          .values(players.map((p) => ({ bookingId: booking.id, userId: p.userId, name: p.name })))
          .returning()
      : []

    return NextResponse.json({ booking: { ...booking, players: savedPlayers } }, { status: 201 })
  } catch (e) {
    console.error('Insert booking error:', e)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
