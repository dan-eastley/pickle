import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Where the authenticated storageState is written by auth.setup.js and read by
// the smoke specs (gitignored via .auth/).
export const authFile = resolve(__dirname, '../../.auth/user.json')

// Whether e2e can authenticate. When false (no seeded creds provided), the
// auth-gated specs skip rather than fail — the public checks still run.
export const hasTestCreds = Boolean(process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD)
