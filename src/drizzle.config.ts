import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

// drizzle-kit reads this for `db:generate` (offline, schema → SQL) and
// `db:migrate` / `db:push` (which need DATABASE_URL set in the environment).
export default defineConfig({
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  verbose: true,
  strict: true,
})
