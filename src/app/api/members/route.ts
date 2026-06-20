import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { getAllUsers } from '@/lib/db/queries'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'member']).default('member'),
})

export async function GET() {
  const session = await auth()
  const role = session?.user?.role
  if (role !== 'admin' && role !== 'member') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const data = await getAllUsers()
  return NextResponse.json({ members: data })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (session?.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { name, email, password, role } = parsed.data
  const passwordHash = await bcrypt.hash(password, 10)

  try {
    const [user] = await db
      .insert(users)
      .values({ id: crypto.randomUUID(), name, email, passwordHash, role })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role })
    return NextResponse.json({ member: user }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
  }
}
