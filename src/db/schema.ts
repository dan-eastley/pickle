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
import { pgEnum, pgTable, text, boolean, integer, timestamp, unique } from 'drizzle-orm/pg-core'

// Coarse access-control tier. `admin` is the platform super-user (sees and edits
// everything). `member` gains rights per-architecture via architecture_membership
// below. `viewer` is read-only everywhere. Not client-settable (see lib/auth).
export const accessTier = pgEnum('access_tier', ['admin', 'member', 'viewer'])

// Per-architecture access role. A user's effective rights on an architecture are
// global-admin OR their membership role here. See src/lib/permissions.js.
export const architectureRole = pgEnum('architecture_role', ['owner', 'contributor', 'consumer'])

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
  // Better Auth two-factor plugin: whether the user has 2FA (email OTP) enabled.
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  ...timestamps,
})

// Better Auth two-factor plugin table. Holds the per-user 2FA secret and backup
// codes; a row exists once a user is enrolled. `verified` gates whether the
// factor is active.
export const twoFactor = pgTable('two_factor', {
  id: text('id').primaryKey(),
  secret: text('secret').notNull(),
  backupCodes: text('backup_codes').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  // Required by the Better Auth two-factor plugin: whether the factor is
  // verified, and rate-limit/lockout bookkeeping for failed code attempts.
  verified: boolean('verified').notNull().default(true),
  failedVerificationCount: integer('failed_verification_count').notNull().default(0),
  lockedUntil: timestamp('locked_until', { mode: 'date', withTimezone: true }),
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

// Maps a user to an architecture with a role. Absence of a row = no per-architecture
// rights (a global admin still has full access). One role per (user, architecture).
export const architectureMembership = pgTable(
  'architecture_membership',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    // The architecture id (folder name under architectures/, e.g. "fedc").
    architectureId: text('architecture_id').notNull(),
    role: architectureRole('role').notNull(),
    // Who granted this membership (Owner or Admin); null if seeded/system.
    grantedBy: text('granted_by').references(() => user.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => ({ uniqUserArchitecture: unique().on(t.userId, t.architectureId) })
)

export const schema = {
  user,
  session,
  account,
  verification,
  architectureMembership,
  twoFactor,
}
