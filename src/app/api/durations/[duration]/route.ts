import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bookingDurations } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ duration: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { duration } = await params
  const d = parseInt(duration)
  if (isNaN(d)) return NextResponse.json({ error: 'Invalid duration' }, { status: 400 })

  await db.delete(bookingDurations).where(eq(bookingDurations.duration, d))
  return new NextResponse(null, { status: 204 })
}
