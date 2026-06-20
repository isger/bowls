import bcrypt from 'bcryptjs'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { format, addDays } from 'date-fns'
import * as schema from '../lib/db/schema'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'file:./bowls.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const db = drizzle(client, { schema })

async function seed() {
  console.log('Seeding database...')

  await db.delete(schema.bookingPlayers)
  await db.delete(schema.bookings)
  await db.delete(schema.timeSlots)
  await db.delete(schema.rinks)
  await db.delete(schema.users)

  const adminId = crypto.randomUUID()
  const memberId = crypto.randomUUID()
  const adminHash = await bcrypt.hash('admin123', 10)
  const memberHash = await bcrypt.hash('member123', 10)

  await db.insert(schema.users).values([
    { id: adminId, name: 'Club Admin', email: 'admin@club.test', passwordHash: adminHash, role: 'admin' },
    { id: memberId, name: 'Jane Member', email: 'member@club.test', passwordHash: memberHash, role: 'member' },
  ])

  await db.insert(schema.rinks).values([
    { number: 1, label: 'Rink 1' },
    { number: 2, label: 'Rink 2' },
    { number: 3, label: 'Rink 3' },
    { number: 4, label: 'Rink 4' },
    { number: 5, label: 'Rink 5' },
    { number: 6, label: 'Rink 6' },
  ])

  await db.insert(schema.timeSlots).values([
    { startTime: '08:00', endTime: '10:00', sortOrder: 1 },
    { startTime: '10:00', endTime: '12:00', sortOrder: 2 },
    { startTime: '12:00', endTime: '14:00', sortOrder: 3 },
    { startTime: '14:00', endTime: '16:00', sortOrder: 4 },
    { startTime: '16:00', endTime: '18:00', sortOrder: 5 },
    { startTime: '18:00', endTime: '20:00', sortOrder: 6 },
  ])

  const rinks = await db.select().from(schema.rinks).orderBy(schema.rinks.number)
  const slots = await db.select().from(schema.timeSlots).orderBy(schema.timeSlots.sortOrder)

  const today = format(new Date(), 'yyyy-MM-dd')
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  const b = (date: string, rinkIdx: number, slotIdx: number, type: schema.BookingType, title: string) => ({
    date,
    rinkId: rinks[rinkIdx].id,
    timeSlotId: slots[slotIdx].id,
    type,
    title,
    createdBy: adminId,
  })

  await db.insert(schema.bookings).values([
    b(today, 0, 0, 'open-play',   'Open Play'),
    b(today, 1, 0, 'roll-up',     'Club Roll-Up'),
    b(today, 0, 1, 'roll-up',     'Club Roll-Up'),
    b(today, 1, 1, 'league',      'Monday League'),
    b(today, 2, 1, 'league',      'Monday League'),
    b(today, 3, 1, 'competition', 'National Pairs'),
    b(today, 4, 1, 'competition', 'National Pairs'),
    b(today, 5, 1, 'roll-up',     'Club Roll-Up'),
    b(today, 0, 3, 'private',     'Private Hire'),
    b(today, 2, 3, 'open-play',   'Open Play'),
    b(today, 4, 4, 'league',      'Evening League'),
    b(today, 5, 4, 'league',      'Evening League'),
    b(tomorrow, 0, 1, 'competition', 'Club Championship'),
    b(tomorrow, 1, 1, 'competition', 'Club Championship'),
    b(tomorrow, 2, 1, 'roll-up',     'Club Roll-Up'),
    b(tomorrow, 3, 2, 'open-play',   'Open Play'),
    b(tomorrow, 0, 4, 'league',      'Tuesday Evening League'),
  ])

  console.log('✓ Seeded: 2 users, 6 rinks, 6 time slots, 17 bookings')
  console.log('  admin@club.test / admin123')
  console.log('  member@club.test / member123')
  client.close()
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
