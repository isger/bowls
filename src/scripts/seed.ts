import bcrypt from 'bcryptjs'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { eq } from 'drizzle-orm'
import { format, addDays } from 'date-fns'
import * as schema from '../lib/db/schema'

const sqlite = new Database('./bowls.db')
const db = drizzle(sqlite, { schema })

async function seed() {
  console.log('Seeding database...')

  db.delete(schema.bookings).run()
  db.delete(schema.timeSlots).run()
  db.delete(schema.rinks).run()
  db.delete(schema.users).run()

  const adminId = crypto.randomUUID()
  const memberId = crypto.randomUUID()
  const adminHash = await bcrypt.hash('admin123', 10)
  const memberHash = await bcrypt.hash('member123', 10)

  db.insert(schema.users).values([
    { id: adminId, name: 'Club Admin', email: 'admin@club.test', passwordHash: adminHash, role: 'admin' },
    { id: memberId, name: 'Jane Member', email: 'member@club.test', passwordHash: memberHash, role: 'member' },
  ]).run()

  db.insert(schema.rinks).values([
    { number: 1, label: 'Rink 1' },
    { number: 2, label: 'Rink 2' },
    { number: 3, label: 'Rink 3' },
    { number: 4, label: 'Rink 4' },
    { number: 5, label: 'Rink 5' },
    { number: 6, label: 'Rink 6' },
  ]).run()

  db.insert(schema.timeSlots).values([
    { startTime: '08:00', endTime: '10:00', sortOrder: 1 },
    { startTime: '10:00', endTime: '12:00', sortOrder: 2 },
    { startTime: '12:00', endTime: '14:00', sortOrder: 3 },
    { startTime: '14:00', endTime: '16:00', sortOrder: 4 },
    { startTime: '16:00', endTime: '18:00', sortOrder: 5 },
    { startTime: '18:00', endTime: '20:00', sortOrder: 6 },
  ]).run()

  const rinks = db.select().from(schema.rinks).orderBy(schema.rinks.number).all()
  const slots = db.select().from(schema.timeSlots).orderBy(schema.timeSlots.sortOrder).all()

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

  db.insert(schema.bookings).values([
    b(today, 0, 0, 'open-play',    'Open Play'),
    b(today, 1, 0, 'roll-up',      'Club Roll-Up'),
    b(today, 0, 1, 'roll-up',      'Club Roll-Up'),
    b(today, 1, 1, 'league',       'Monday League'),
    b(today, 2, 1, 'league',       'Monday League'),
    b(today, 3, 1, 'competition',  'National Pairs'),
    b(today, 4, 1, 'competition',  'National Pairs'),
    b(today, 5, 1, 'roll-up',      'Club Roll-Up'),
    b(today, 0, 3, 'private',      'Private Hire'),
    b(today, 2, 3, 'open-play',    'Open Play'),
    b(today, 4, 4, 'league',       'Evening League'),
    b(today, 5, 4, 'league',       'Evening League'),
    b(tomorrow, 0, 1, 'competition', 'Club Championship'),
    b(tomorrow, 1, 1, 'competition', 'Club Championship'),
    b(tomorrow, 2, 1, 'roll-up',     'Club Roll-Up'),
    b(tomorrow, 3, 2, 'open-play',   'Open Play'),
    b(tomorrow, 0, 4, 'league',      'Tuesday Evening League'),
  ]).run()

  console.log('✓ Seeded: 2 users, 6 rinks, 6 time slots, 17 bookings')
  console.log('  admin@club.test / admin123')
  console.log('  member@club.test / member123')
  sqlite.close()
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
