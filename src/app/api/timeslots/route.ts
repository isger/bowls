import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { timeSlots } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/

const createSchema = z.object({
  startTime: z.string().regex(timeRegex, 'Must be HH:MM'),
  endTime: z.string().regex(timeRegex, 'Must be HH:MM'),
})

export async function GET() {
  const rows = await db.select().from(timeSlots).orderBy(timeSlots.startTime)
  return NextResponse.json({ timeSlots: rows })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { startTime, endTime } = parsed.data

  const [maxRow] = await db
    .select({ sortOrder: timeSlots.sortOrder })
    .from(timeSlots)
    .orderBy(desc(timeSlots.sortOrder))
    .limit(1)

  const sortOrder = (maxRow?.sortOrder ?? 0) + 1

  const [slot] = await db
    .insert(timeSlots)
    .values({ startTime, endTime, sortOrder })
    .returning()

  return NextResponse.json({ timeSlot: slot }, { status: 201 })
}
