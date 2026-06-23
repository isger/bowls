import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bookingPlayers, bookings } from '@/lib/db/schema'
import { getBookingById } from '@/lib/db/queries'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const playerSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(1).max(100),
})

const updateSchema = z.object({
  type: z.enum(['roll-up', 'competition', 'league', 'open-play', 'private']).optional(),
  title: z.string().min(1).max(100).optional(),
  notes: z.string().max(500).nullable().optional(),
  players: z.array(playerSchema).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const role = session?.user?.role
  const userId = session?.user?.id

  if (role !== 'admin' && role !== 'member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const bookingId = parseInt(id)
  if (isNaN(bookingId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const existing = await getBookingById(bookingId)
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Members can only edit their own bookings
  if (role === 'member' && existing.createdBy !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { players, ...fields } = parsed.data

  const [updated] = await db
    .update(bookings)
    .set({ ...fields, updatedAt: Date.now() })
    .where(eq(bookings.id, bookingId))
    .returning()

  let savedPlayers: (typeof bookingPlayers.$inferSelect)[]
  if (players !== undefined) {
    await db.delete(bookingPlayers).where(eq(bookingPlayers.bookingId, bookingId))
    savedPlayers = players.length
      ? await db
          .insert(bookingPlayers)
          .values(players.map((p) => ({ bookingId, userId: p.userId, name: p.name })))
          .returning()
      : []
  } else {
    savedPlayers = await db
      .select()
      .from(bookingPlayers)
      .where(eq(bookingPlayers.bookingId, bookingId))
  }

  return NextResponse.json({ booking: { ...updated, players: savedPlayers } })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const bookingId = parseInt(id)
  if (isNaN(bookingId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  await db.delete(bookings).where(eq(bookings.id, bookingId))
  return new NextResponse(null, { status: 204 })
}
