import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bookings, timeSlots } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const slotId = parseInt(id)
  if (isNaN(slotId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const inUse = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(eq(bookings.timeSlotId, slotId))
    .limit(1)

  if (inUse.length > 0) {
    return NextResponse.json(
      { error: 'This time slot has existing bookings and cannot be deleted' },
      { status: 409 }
    )
  }

  await db.delete(timeSlots).where(eq(timeSlots.id, slotId))
  return new NextResponse(null, { status: 204 })
}
