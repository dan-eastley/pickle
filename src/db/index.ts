/**
 * Drizzle database client (node-postgres pool).
 *
 * The pool is created from DATABASE_URL. Construction does not open a
 * connection, so importing this module is safe even when the variable is unset
 * (the content/github functions and the SPA never touch the DB) — only an actual
 * auth query will fail, which the auth endpoint surfaces as a 503.
 */
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema.js'

export const isDbConfigured = Boolean(process.env.DATABASE_URL)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Vercel functions are short-lived; keep the per-invocation pool tiny.
  max: 1,
})

export const db = drizzle(pool, { schema })
export type Database = typeof db
