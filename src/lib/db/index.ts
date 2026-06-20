import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const globalForDb = globalThis as unknown as {
  _sqlite?: InstanceType<typeof Database>
  _db?: ReturnType<typeof drizzle>
}

const sqlite = globalForDb._sqlite ?? new Database('./bowls.db')
export const db = globalForDb._db ?? drizzle(sqlite, { schema })

if (process.env.NODE_ENV !== 'production') {
  globalForDb._sqlite = sqlite
  globalForDb._db = db
}
