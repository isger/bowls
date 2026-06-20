import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { rinks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const updateSchema = z.object({
  number: z.number().int().min(1).max(99).optional(),
  label: z.string().max(50).nullable().optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const rinkId = parseInt(id)
  if (isNaN(rinkId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const [updated] = await db
    .update(rinks)
    .set(parsed.data)
    .where(eq(rinks.id, rinkId))
    .returning()

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ rink: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const rinkId = parseInt(id)
  if (isNaN(rinkId)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  await db.delete(rinks).where(eq(rinks.id, rinkId))
  return new NextResponse(null, { status: 204 })
}
