/**
 * Database schema (Drizzle ORM, Postgres).
 *
 * The four core tables are required by Better Auth (user / session / account /
 * verification). The `user` table carries our extra fields: firstName, lastName,
 * a coarse accessTier enum (for the access control to come), and a jobRole drawn
 * from config/roles.json.
 *
 * Migrations are generated with `npm run db:generate` and applied with
 * `npm run db:migrate`. Do not hand-edit applied migrations.
 */
import { pgEnum, pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core'

// Coarse access-control tier. Real enforcement (and client→user mapping) comes
// later; for now every authenticated user can see everything.
export const accessTier = pgEnum('access_tier', ['admin', 'member', 'viewer'])

const timestamps = {
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).notNull().defaultNow(),
}

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  // Better Auth keeps a single display `name`; we populate it from first + last.
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  // Custom profile fields.
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  jobRole: text('job_role'), // id from config/roles.json, validated in lib/auth
  accessTier: accessTier('access_tier').notNull().default('member'),
  ...timestamps,
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  ...timestamps,
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { mode: 'date', withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
    mode: 'date',
    withTimezone: true,
  }),
  scope: text('scope'),
  // For email/password accounts, the hashed password lives here.
  password: text('password'),
  ...timestamps,
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { mode: 'date', withTimezone: true }).notNull(),
  ...timestamps,
})

export const schema = { user, session, account, verification }
