import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'member'] }).notNull().default('member'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch() * 1000)`),
})

export const rinks = sqliteTable('rinks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  number: integer('number').notNull().unique(),
  label: text('label'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
})

export const timeSlots = sqliteTable('time_slots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  sortOrder: integer('sort_order').notNull(),
})

export const bookings = sqliteTable(
  'bookings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    date: text('date').notNull(),
    rinkId: integer('rink_id').notNull().references(() => rinks.id, { onDelete: 'cascade' }),
    timeSlotId: integer('time_slot_id').notNull().references(() => timeSlots.id, { onDelete: 'cascade' }),
    type: text('type', {
      enum: ['roll-up', 'competition', 'league', 'open-play', 'private'],
    }).notNull(),
    title: text('title').notNull(),
    notes: text('notes'),
    durationSlots: integer('duration_slots').notNull().default(1),
    createdBy: text('created_by').notNull().references(() => users.id),
    createdAt: integer('created_at').notNull().default(sql`(unixepoch() * 1000)`),
    updatedAt: integer('updated_at').notNull().default(sql`(unixepoch() * 1000)`),
  },
  (t) => [unique().on(t.date, t.rinkId, t.timeSlotId)]
)

export const bookingPlayers = sqliteTable('booking_players', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingId: integer('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
})

export type User = typeof users.$inferSelect
export type Rink = typeof rinks.$inferSelect
export type TimeSlot = typeof timeSlots.$inferSelect
export type Booking = typeof bookings.$inferSelect
export type BookingPlayer = typeof bookingPlayers.$inferSelect
export type BookingWithPlayers = Booking & { players: BookingPlayer[] }
export type BookingType = Booking['type']
