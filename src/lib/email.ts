/**
 * Transactional email via Resend.
 *
 * On-brand, simple, friendly templates for the auth + collaboration flows:
 *   - welcome (on sign-up)
 *   - email verification (6-digit OTP, on sign-up and login)
 *   - password reset (link)
 *   - architecture invite (on grant-access)
 *
 * Required env: RESEND_API_KEY, RESEND_EMAIL_DOMAIN. If they're unset (e.g. a
 * local dev box with no mail provider) send() is a no-op that logs and returns
 * { ok: false, skipped: true } — so auth flows degrade gracefully rather than
 * crashing.
 */
import { Resend } from 'resend'

const BRAND_BLUE = '#004EEB'
const BRAND_ROSE = '#E11D48'

function fromAddress(): string {
  const domain = process.env.RESEND_EMAIL_DOMAIN || 'eastley.net'
  return `Pickle <pickle@${domain}>`
}

function appUrl(): string {
  return (process.env.BETTER_AUTH_URL || 'https://pickle-psi-neon.vercel.app').replace(/\/+$/, '')
}

let client: Resend | undefined
function resend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  if (!client) client = new Resend(process.env.RESEND_API_KEY)
  return client
}

export interface SendResult {
  ok: boolean
  skipped?: boolean
  error?: string
}

export async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  const r = resend()
  if (!r) {
    console.warn(`[email] RESEND_API_KEY unset — skipping "${subject}" to ${to}`)
    return { ok: false, skipped: true }
  }
  try {
    const { error } = await r.emails.send({ from: fromAddress(), to, subject, html })
    if (error) {
      console.error(`[email] send failed to ${to}:`, error)
      return { ok: false, error: String(error.message ?? error) }
    }
    return { ok: true }
  } catch (e) {
    console.error(`[email] send threw for ${to}:`, e)
    return { ok: false, error: e instanceof Error ? e.message : String(e) }
  }
}

// ── Shared branded layout ────────────────────────────────────────────────────

const esc = (s: string) =>
  String(s).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!
  )

function layout(opts: { heading: string; body: string; preview?: string }): string {
  const { heading, body, preview = '' } = opts
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
  </head>
  <body style="margin:0;padding:0;background:#F9FAFB;font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#344054;">
    <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preview)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#FFFFFF;border:1px solid #EAECF0;">
            <tr>
              <td style="height:4px;background:linear-gradient(90deg,${BRAND_BLUE},${BRAND_ROSE});font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:28px 32px 8px 32px;">
                <div style="font-weight:700;letter-spacing:0.16em;font-size:16px;background:linear-gradient(90deg,${BRAND_BLUE},${BRAND_ROSE});-webkit-background-clip:text;background-clip:text;color:${BRAND_BLUE};-webkit-text-fill-color:transparent;">PICKLE</div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 4px 32px;">
                <h1 style="margin:0;font-size:20px;line-height:1.3;font-weight:600;color:#101828;">${esc(heading)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 32px 28px 32px;font-size:14px;line-height:1.6;color:#475467;">
                ${body}
              </td>
            </tr>
          </table>
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
            <tr>
              <td style="padding:16px 32px;font-size:12px;line-height:1.5;color:#98A2B3;">
                Pickle — architecture your whole team can actually use.<br />
                You're receiving this because someone used this address with Pickle. If that wasn't you, you can ignore this email.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;"><tr>
    <td style="background:${BRAND_BLUE};">
      <a href="${esc(href)}" style="display:inline-block;padding:11px 20px;font-size:14px;font-weight:600;color:#FFFFFF;text-decoration:none;">${esc(label)}</a>
    </td></tr></table>`
}

function codeBlock(code: string): string {
  return `<div style="margin:20px 0;padding:16px;background:#F9FAFB;border:1px solid #EAECF0;text-align:center;">
    <div style="font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;font-size:30px;font-weight:600;letter-spacing:0.32em;color:#101828;padding-left:0.32em;">${esc(code)}</div>
  </div>`
}

// ── Templates ────────────────────────────────────────────────────────────────

export function sendWelcomeEmail(to: string, firstName?: string): Promise<SendResult> {
  const hi = firstName ? `Hi ${esc(firstName)},` : 'Hi,'
  const body = `<p style="margin:0 0 12px;">${hi}</p>
    <p style="margin:0 0 12px;">Welcome to Pickle — a working architecture repository your whole team can actually use. Capture architecture as structured data, propose changes through governed decisions, and let the agents do the analysis.</p>
    <p style="margin:0 0 4px;">A few good places to start:</p>
    <ul style="margin:0 0 12px;padding-left:20px;">
      <li>Browse the architecture by domain and abstraction layer.</li>
      <li>Raise an Architecture Decision and watch the analysis run.</li>
      <li>Ask the Discovery agent a question about your architecture.</li>
    </ul>
    ${button(`${appUrl()}/architectures`, 'Open Pickle')}
    <p style="margin:0;">Glad to have you on board.</p>`
  return sendEmail(
    to,
    'Welcome to Pickle',
    layout({ heading: 'Welcome to Pickle', body, preview: 'Your Pickle account is ready.' })
  )
}

export type OtpType = 'sign-in' | 'email-verification' | 'forget-password' | 'change-email'

export function sendOtpEmail(to: string, otp: string, type: OtpType): Promise<SendResult> {
  const headings: Record<OtpType, string> = {
    'sign-in': 'Your sign-in code',
    'email-verification': 'Verify your email',
    'forget-password': 'Your password reset code',
    'change-email': 'Confirm your new email',
  }
  const intro: Record<OtpType, string> = {
    'sign-in': 'Use this code to sign in to Pickle:',
    'email-verification': 'Use this code to confirm your email address:',
    'forget-password': 'Use this code to reset your Pickle password:',
    'change-email': 'Use this code to confirm your new email address:',
  }
  const body = `<p style="margin:0 0 4px;">${intro[type]}</p>
    ${codeBlock(otp)}
    <p style="margin:0;color:#98A2B3;font-size:13px;">This code expires in 10 minutes. If you didn't request it, you can safely ignore this email.</p>`
  return sendEmail(
    to,
    `${headings[type]} — ${otp}`,
    layout({ heading: headings[type], body, preview: `Your Pickle code is ${otp}` })
  )
}

export function sendResetPasswordEmail(to: string, url: string): Promise<SendResult> {
  const body = `<p style="margin:0 0 12px;">We received a request to reset your Pickle password. Click below to choose a new one:</p>
    ${button(url, 'Reset password')}
    <p style="margin:0;color:#98A2B3;font-size:13px;">This link expires in 1 hour. If you didn't request a reset, you can ignore this email — your password won't change.</p>`
  return sendEmail(
    to,
    'Reset your Pickle password',
    layout({ heading: 'Reset your password', body, preview: 'Reset your Pickle password.' })
  )
}

export function sendInviteEmail(
  to: string,
  opts: { architectureName: string; architectureId: string; role: string; inviterName?: string }
): Promise<SendResult> {
  const by = opts.inviterName ? ` by ${esc(opts.inviterName)}` : ''
  const link = `${appUrl()}/architectures/${encodeURIComponent(opts.architectureId)}/transitions`
  const body = `<p style="margin:0 0 12px;">You've been given <strong>${esc(opts.role)}</strong> access to the <strong>${esc(opts.architectureName)}</strong> architecture on Pickle${by}.</p>
    <p style="margin:0 0 4px;">You can now view and collaborate on it based on your role.</p>
    ${button(link, 'Open the architecture')}
    <p style="margin:0;">See you in there.</p>`
  return sendEmail(
    to,
    `You've been invited to the ${opts.architectureName} architecture on Pickle`,
    layout({
      heading: `You're invited to ${esc(opts.architectureName)}`,
      body,
      preview: `${opts.role} access on Pickle.`,
    })
  )
}
