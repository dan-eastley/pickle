# Database & Authentication

Authentication uses [Better Auth](https://better-auth.com) (email + password)
backed by Postgres via [Drizzle ORM](https://orm.drizzle.team). Schema changes
are made through **migrations** — never by editing the database directly.

## Layout

```
src/
├── db/
│   ├── schema.ts          # Drizzle schema (user/session/account/verification)
│   ├── index.ts           # Drizzle client (node-postgres pool)
│   └── migrations/        # Generated SQL migrations (committed)
├── drizzle.config.ts      # drizzle-kit config
├── lib/auth.ts            # Better Auth server config
├── lib/authClient.ts      # Better Auth React client
└── api/auth/[...all].ts   # /api/auth/* serverless handler
```

## Environment

Copy `.env.example` to `.env` (gitignored) and set:

| Variable             | Purpose                                                            |
| -------------------- | ------------------------------------------------------------------ |
| `DATABASE_URL`       | Postgres connection string (use the **pooled** Neon URL on Vercel) |
| `BETTER_AUTH_SECRET` | Session signing secret — `openssl rand -base64 32`                 |
| `BETTER_AUTH_URL`    | App base URL (`http://localhost:3000` in dev)                      |

On Vercel, set the same variables in **Project → Settings → Environment
Variables**. Add the Postgres database via **Storage → Create → Postgres
(Neon)**; Vercel injects `DATABASE_URL` automatically, but confirm it's the
pooled connection string.

## Provisioning & migrations

```bash
# 1. Generate a migration after changing db/schema.ts (offline, no DB needed)
npm run db:generate

# 2. Apply migrations to the database in DATABASE_URL
npm run db:migrate

# Inspect data
npm run db:studio
```

`db:push` (schema → DB without a migration file) is available for throwaway dev
databases, but **prefer `db:generate` + `db:migrate`** so every change is a
reviewable, committed migration.

## Access model (current)

- Every authenticated user can see everything for now.
- `user.accessTier` (`admin` / `member` / `viewer`) exists but is **not yet
  enforced**; it is not settable by clients at sign-up (defaults to `member`).
- `user.jobRole` is an id from `config/roles.json`.
- Mapping clients → users (per-tenant access) is future work.
