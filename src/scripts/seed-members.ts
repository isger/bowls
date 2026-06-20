import bcrypt from 'bcryptjs'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../lib/db/schema'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL ?? 'file:./bowls.db',
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const db = drizzle(client, { schema })

const TEST_MEMBERS = [
  { name: 'Alice Thompson',   email: 'alice.thompson@example.com' },
  { name: 'Brian Foster',     email: 'brian.foster@example.com' },
  { name: 'Carol Hughes',     email: 'carol.hughes@example.com' },
  { name: 'David Patel',      email: 'david.patel@example.com' },
  { name: 'Eleanor Gibbs',    email: 'eleanor.gibbs@example.com' },
  { name: 'Frank Morrison',   email: 'frank.morrison@example.com' },
  { name: 'Grace Lawson',     email: 'grace.lawson@example.com' },
  { name: 'Harold Bennett',   email: 'harold.bennett@example.com' },
  { name: 'Irene Walters',    email: 'irene.walters@example.com' },
  { name: 'James Thornton',   email: 'james.thornton@example.com' },
  { name: 'Karen Mills',      email: 'karen.mills@example.com' },
  { name: 'Leonard Carr',     email: 'leonard.carr@example.com' },
  { name: 'Margaret Stone',   email: 'margaret.stone@example.com' },
  { name: 'Norman Price',     email: 'norman.price@example.com' },
  { name: 'Olive Barker',     email: 'olive.barker@example.com' },
  { name: 'Peter Walsh',      email: 'peter.walsh@example.com' },
  { name: 'Rachel Simmons',   email: 'rachel.simmons@example.com' },
  { name: 'Stanley Cooper',   email: 'stanley.cooper@example.com' },
  { name: 'Teresa Fowler',    email: 'teresa.fowler@example.com' },
  { name: 'Victor Hammond',   email: 'victor.hammond@example.com' },
]

async function seedMembers() {
  console.log('Inserting 20 test members…')
  const passwordHash = await bcrypt.hash('member123', 10)

  for (const m of TEST_MEMBERS) {
    try {
      await db.insert(schema.users).values({
        id: crypto.randomUUID(),
        name: m.name,
        email: m.email,
        passwordHash,
        role: 'member',
      })
      console.log(`  ✓ ${m.name}`)
    } catch {
      console.log(`  – ${m.name} already exists, skipping`)
    }
  }

  console.log('Done. All members use password: member123')
  client.close()
}

seedMembers().catch((e) => {
  console.error(e)
  process.exit(1)
})
