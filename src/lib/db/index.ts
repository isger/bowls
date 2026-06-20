import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

const globalForDb = globalThis as unknown as {
  _db?: ReturnType<typeof drizzle>
}

function createDb() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL ?? 'file:./bowls.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  return drizzle(client, { schema })
}

export const db = globalForDb._db ?? createDb()

if (process.env.NODE_ENV !== 'production') {
  globalForDb._db = db
}
