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
    { startTime: '08:00', endTime: '09:00', sortOrder: 1 },
    { startTime: '09:00', endTime: '10:00', sortOrder: 2 },
    { startTime: '10:00', endTime: '11:00', sortOrder: 3 },
    { startTime: '11:00', endTime: '12:00', sortOrder: 4 },
    { startTime: '12:00', endTime: '13:00', sortOrder: 5 },
    { startTime: '13:00', endTime: '14:00', sortOrder: 6 },
    { startTime: '14:00', endTime: '15:00', sortOrder: 7 },
    { startTime: '15:00', endTime: '16:00', sortOrder: 8 },
    { startTime: '16:00', endTime: '17:00', sortOrder: 9 },
    { startTime: '17:00', endTime: '18:00', sortOrder: 10 },
    { startTime: '18:00', endTime: '19:00', sortOrder: 11 },
    { startTime: '19:00', endTime: '20:00', sortOrder: 12 },
  ])

  const rinks = await db.select().from(schema.rinks).orderBy(schema.rinks.number)
  const slots = await db.select().from(schema.timeSlots).orderBy(schema.timeSlots.sortOrder)

  const today = format(new Date(), 'yyyy-MM-dd')
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  const b = (
    date: string, rinkIdx: number, slotIdx: number,
    type: schema.BookingType, title: string, durationSlots = 1
  ) => ({
    date,
    rinkId: rinks[rinkIdx].id,
    timeSlotId: slots[slotIdx].id,
    type,
    title,
    durationSlots,
    createdBy: adminId,
  })

  await db.insert(schema.bookings).values([
    // Today — slots 0-11 (08:00–20:00 in 1hr blocks)
    b(today, 0, 0, 'open-play',   'Open Play',        2), // 08:00–10:00
    b(today, 1, 0, 'roll-up',     'Club Roll-Up',     2), // 08:00–10:00
    b(today, 0, 2, 'roll-up',     'Club Roll-Up'),        // 10:00–11:00
    b(today, 1, 2, 'league',      'Monday League',    2), // 10:00–12:00
    b(today, 2, 2, 'league',      'Monday League',    2), // 10:00–12:00
    b(today, 3, 2, 'competition', 'National Pairs',   3), // 10:00–13:00
    b(today, 4, 2, 'competition', 'National Pairs',   3), // 10:00–13:00
    b(today, 5, 2, 'roll-up',     'Club Roll-Up'),        // 10:00–11:00
    b(today, 0, 6, 'private',     'Private Hire',     2), // 14:00–16:00
    b(today, 2, 6, 'open-play',   'Open Play'),           // 14:00–15:00
    b(today, 4, 8, 'league',      'Evening League',   2), // 16:00–18:00
    b(today, 5, 8, 'league',      'Evening League',   2), // 16:00–18:00
    // Tomorrow
    b(tomorrow, 0, 2, 'competition', 'Club Championship', 2),
    b(tomorrow, 1, 2, 'competition', 'Club Championship', 2),
    b(tomorrow, 2, 2, 'roll-up',     'Club Roll-Up'),
    b(tomorrow, 3, 4, 'open-play',   'Open Play'),
    b(tomorrow, 0, 8, 'league',      'Tuesday Evening League', 2),
  ])

  console.log('✓ Seeded: 2 users, 6 rinks, 12 time slots, 17 bookings')
  console.log('  admin@club.test / admin123')
  console.log('  member@club.test / member123')
  client.close()
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
