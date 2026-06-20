import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { rinks } from '@/lib/db/schema'
import { getAllRinks } from '@/lib/db/queries'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createSchema = z.object({
  number: z.number().int().min(1).max(99),
  label: z.string().max(50).optional(),
})

export async function GET() {
  const data = await getAllRinks()
  return NextResponse.json({ rinks: data })
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

  try {
    const [rink] = await db.insert(rinks).values(parsed.data).returning()
    return NextResponse.json({ rink }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Rink number already exists' }, { status: 409 })
  }
}
