import { and, eq, inArray } from 'drizzle-orm'
import { db } from './index'
import { bookingPlayers, bookings, rinks, timeSlots, users } from './schema'
import type { BookingWithPlayers } from './schema'

type SlotRow = { id: number }
type BookingRow = { id: number; timeSlotId: number; durationSlots: number | null }

export function detectConflict(
  timeSlotId: number,
  durationSlots: number,
  allSlots: SlotRow[],
  existing: BookingRow[],
  excludeId?: number
): boolean {
  const startIdx = allSlots.findIndex((s) => s.id === timeSlotId)
  if (startIdx === -1) return false
  const newSlotIds = new Set(allSlots.slice(startIdx, startIdx + durationSlots).map((s) => s.id))
  for (const b of existing) {
    if (b.id === excludeId) continue
    const bIdx = allSlots.findIndex((s) => s.id === b.timeSlotId)
    if (bIdx === -1) continue
    const bSlotIds = allSlots.slice(bIdx, bIdx + (b.durationSlots ?? 1)).map((s) => s.id)
    if (bSlotIds.some((id) => newSlotIds.has(id))) return true
  }
  return false
}

export async function getActiveRinks() {
  return db
    .select()
    .from(rinks)
    .where(eq(rinks.isActive, true))
    .orderBy(rinks.number)
}

export async function getAllRinks() {
  return db.select().from(rinks).orderBy(rinks.number)
}

export async function getTimeSlots() {
  return db.select().from(timeSlots).orderBy(timeSlots.sortOrder)
}

export async function getBookingsForDate(date: string): Promise<BookingWithPlayers[]> {
  const rows = await db.select().from(bookings).where(eq(bookings.date, date))
  if (rows.length === 0) return []
  const players = await db
    .select()
    .from(bookingPlayers)
    .where(inArray(bookingPlayers.bookingId, rows.map((b) => b.id)))
  return rows.map((b) => ({ ...b, players: players.filter((p) => p.bookingId === b.id) }))
}

export async function getBookingById(id: number) {
  const rows = await db.select().from(bookings).where(eq(bookings.id, id))
  return rows[0] ?? null
}

export async function getUserByEmail(email: string) {
  const rows = await db.select().from(users).where(eq(users.email, email))
  return rows[0] ?? null
}

export async function getAllUsers() {
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.name)
}

export async function checkBookingConflict(
  date: string,
  rinkId: number,
  timeSlotId: number,
  durationSlots: number,
  excludeId?: number
) {
  const [allSlots, existing] = await Promise.all([
    db.select({ id: timeSlots.id }).from(timeSlots).orderBy(timeSlots.sortOrder),
    db
      .select({ id: bookings.id, timeSlotId: bookings.timeSlotId, durationSlots: bookings.durationSlots })
      .from(bookings)
      .where(and(eq(bookings.date, date), eq(bookings.rinkId, rinkId))),
  ])
  return detectConflict(timeSlotId, durationSlots, allSlots, existing, excludeId)
}
