import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './log'

function mockRes() {
  const res = { statusCode: 200, body: undefined }
  res.status = vi.fn((c) => ((res.statusCode = c), res))
  res.json = vi.fn((b) => ((res.body = b), res))
  res.end = vi.fn(() => res)
  res.setHeader = vi.fn(() => res)
  return res
}
const call = (req) => {
  const res = mockRes()
  handler({ headers: {}, ...req }, res)
  return res
}

describe('/api/log', () => {
  let err
  beforeEach(() => {
    err = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  it('rejects non-POST', () => {
    const res = call({ method: 'GET' })
    expect(res.statusCode).toBe(405)
  })

  it('writes a tagged structured line and 204s', () => {
    const res = call({
      method: 'POST',
      body: {
        message: 'Cannot access v before initialization',
        stack: 'at Breadcrumb',
        context: {
          route: '/architectures/fedc/baseline/domains',
          version: 'v0.6.10',
          kind: 'boundary',
        },
      },
    })
    expect(res.statusCode).toBe(204)
    expect(err).toHaveBeenCalledOnce()
    const line = err.mock.calls[0][0]
    expect(line).toMatch(/^\[client-error\] /)
    const rec = JSON.parse(line.replace('[client-error] ', ''))
    expect(rec.message).toContain('Cannot access v')
    expect(rec.route).toBe('/architectures/fedc/baseline/domains')
    expect(rec.kind).toBe('boundary')
  })

  it('caps oversized fields and never throws', () => {
    const res = call({ method: 'POST', body: { message: 'x'.repeat(5000) } })
    expect(res.statusCode).toBe(204)
    const rec = JSON.parse(err.mock.calls[0][0].replace('[client-error] ', ''))
    expect(rec.message.length).toBeLessThanOrEqual(1000)
  })

  it('warn level routes to console.warn', () => {
    call({ method: 'POST', body: { level: 'warn', message: 'heads up' } })
    expect(err).not.toHaveBeenCalled()
  })
})
