import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../lib/db/schema'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'file:./bowls.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const db = drizzle(client, { schema })

async function seedDurations() {
  await db.delete(schema.bookingDurations)
  await db.insert(schema.bookingDurations).values([
    { duration: 1 },
    { duration: 2 },
    { duration: 3 },
  ])
  console.log('✓ Default durations set: 1h, 2h, 3h')
  client.close()
}

seedDurations().catch((e) => { console.error(e); process.exit(1) })
