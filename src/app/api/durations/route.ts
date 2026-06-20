import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { bookingDurations } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET() {
  try {
    const rows = await db.select().from(bookingDurations).orderBy(asc(bookingDurations.duration))
    return NextResponse.json({ durations: rows.map((r) => r.duration) })
  } catch {
    return NextResponse.json({ durations: [] })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await req.json()
  const parsed = z.object({ duration: z.number().int().min(1).max(12) }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid duration' }, { status: 400 })

  await db.insert(bookingDurations).values({ duration: parsed.data.duration }).onConflictDoNothing()
  return NextResponse.json({ duration: parsed.data.duration }, { status: 201 })
}
