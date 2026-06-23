import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bookings, timeSlots } from '@/lib/db/schema'
import { detectConflict } from '@/lib/db/queries'
import { and, inArray } from 'drizzle-orm'
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

  // Two queries total regardless of how many dates × rinks are requested
  const [allSlots, existingRaw] = await Promise.all([
    db.select({ id: timeSlots.id }).from(timeSlots).orderBy(timeSlots.startTime),
    db
      .select({ id: bookings.id, date: bookings.date, rinkId: bookings.rinkId, timeSlotId: bookings.timeSlotId, durationSlots: bookings.durationSlots })
      .from(bookings)
      .where(and(inArray(bookings.date, dates), inArray(bookings.rinkId, rinkIds))),
  ])

  // Group existing bookings by date:rinkId for O(1) lookup
  const byKey = new Map<string, { id: number; timeSlotId: number; durationSlots: number | null }[]>()
  for (const b of existingRaw) {
    const key = `${b.date}:${b.rinkId}`
    const arr = byKey.get(key) ?? []
    arr.push(b)
    byKey.set(key, arr)
  }

  const conflicts: { date: string; rinkId: number }[] = []
  const toInsert: { date: string; rinkId: number }[] = []

  for (const date of dates) {
    for (const rinkId of rinkIds) {
      const existing = byKey.get(`${date}:${rinkId}`) ?? []
      if (detectConflict(timeSlotId, durationSlots, allSlots, existing)) {
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
