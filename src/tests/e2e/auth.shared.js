import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Where the authenticated storageState is written by auth.setup.js and read by
// the smoke specs (gitignored via .auth/).
export const authFile = resolve(__dirname, '../../.auth/user.json')

// Login is password + a 6-digit email code (2FA). Automated login can't read
// the email, so — with DATABASE_URL available — the setup reads the code that
// Better Auth just wrote to the verification table. TEST_USER_* + DATABASE_URL
// are the CI secrets that make authenticated smoke possible.
export const hasTestCreds = Boolean(
  process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD && process.env.DATABASE_URL
)

// The most recent 6-digit OTP Better Auth persisted (its verification store),
// read straight from Postgres. Polls briefly since the send is async.
export async function readLatestOtp({ withinSeconds = 30, tries = 8 } = {}) {
  const { default: pg } = await import('pg')
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()
  try {
    for (let i = 0; i < tries; i++) {
      const { rows } = await client.query(
        `select value from verification
         where created_at > now() - interval '${withinSeconds} seconds'
         order by created_at desc limit 1`
      )
      const code = (rows[0]?.value ?? '').match(/\b\d{6}\b/)?.[0]
      if (code) return code
      await new Promise((r) => setTimeout(r, 750))
    }
    return null
  } finally {
    await client.end()
  }
}
