import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bookings } from '@/lib/db/schema'
import { checkBookingConflict } from '@/lib/db/queries'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/

const bulkSchema = z.object({
  dates: z.array(z.string().regex(dateRegex)).min(1).max(365),
  rinkIds: z.array(z.number().int().positive()).min(1).max(50),
  timeSlotId: z.number().int().positive(),
  durationSlots: z.number().int().min(1).max(12).default(1),
  type: z.enum(['roll-up', 'competition', 'league', 'open-play', 'private']),
  title: z.string().min(1).max(100),
  notes: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = bulkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { dates, rinkIds, timeSlotId, durationSlots, type, title, notes } = parsed.data
  const createdBy = session.user.id
  if (!createdBy) {
    return NextResponse.json({ error: 'Session missing user ID' }, { status: 500 })
  }

  const conflicts: { date: string; rinkId: number }[] = []
  const toInsert: { date: string; rinkId: number }[] = []

  for (const date of dates) {
    for (const rinkId of rinkIds) {
      const conflict = await checkBookingConflict(date, rinkId, timeSlotId, durationSlots)
      if (conflict) {
        conflicts.push({ date, rinkId })
      } else {
        toInsert.push({ date, rinkId })
      }
    }
  }

  const created = toInsert.length > 0
    ? (await db
        .insert(bookings)
        .values(toInsert.map(({ date, rinkId }) => ({ date, rinkId, timeSlotId, durationSlots, type, title, notes, createdBy })))
        .returning()).map((b) => ({ ...b, players: [] }))
    : []

  return NextResponse.json({ bookings: created, conflicts }, { status: created.length > 0 ? 201 : 200 })
}
