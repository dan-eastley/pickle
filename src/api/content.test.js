import { describe, it, expect, vi, beforeEach } from 'vitest'

// Tests for the /api/content handler: the session gate on architecture data,
// cache-control partitioning (tenant data never shared-cached), and the
// prefix/path validation — with GitHub and auth mocked.

const h = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  missingAuthEnv: vi.fn(() => []),
  getContents: vi.fn(),
}))

vi.mock('../lib/github', () => {
  class HttpError extends Error {
    constructor(message, statusCode) {
      super(message)
      this.statusCode = statusCode
    }
  }
  class GitHubClient {
    constructor() {
      this.getContents = (...args) => h.getContents(...args)
    }
  }
  return {
    HttpError,
    GitHubClient,
    getGitHubConfig: () => ({ token: 't', owner: 'o', repo: 'r' }),
    b64decode: (s) => Buffer.from(s, 'base64').toString('utf-8'),
  }
})

vi.mock('../lib/auth', () => ({
  missingAuthEnv: (...args) => h.missingAuthEnv(...args),
  getSessionUser: (...args) => h.getSessionUser(...args),
}))

const { default: handler } = await import('./content')

const fileResponse = (content) => ({
  type: 'file',
  name: 'x.json',
  path: 'x.json',
  sha: 's',
  content: Buffer.from(content).toString('base64'),
})

function mockRes() {
  const res = { statusCode: 200, body: undefined, headers: {} }
  res.status = vi.fn((c) => ((res.statusCode = c), res))
  res.json = vi.fn((b) => ((res.body = b), res))
  res.send = vi.fn((b) => ((res.body = b), res))
  res.setHeader = vi.fn((k, v) => ((res.headers[k] = v), res))
  return res
}

async function get(query) {
  const res = mockRes()
  await handler({ method: 'GET', headers: {}, query }, res)
  return res
}

beforeEach(() => {
  vi.clearAllMocks()
  h.getSessionUser.mockResolvedValue(null)
  h.missingAuthEnv.mockReturnValue([])
  h.getContents.mockResolvedValue(fileResponse('{"ok":true}'))
  process.env.VERCEL = '1'
})

describe('/api/content session gate on architecture data', () => {
  it('401s anonymous requests for architectures content', async () => {
    const res = await get({ prefix: 'architectures', path: 'fedc/architecture.json' })
    expect(res.statusCode).toBe(401)
    expect(h.getContents).not.toHaveBeenCalled()
  })

  it('serves architectures content to a session, never shared-cached', async () => {
    h.getSessionUser.mockResolvedValue({ id: 'u1' })
    const res = await get({ prefix: 'architectures', path: 'fedc/architecture.json' })
    expect(res.statusCode).toBe(200)
    expect(res.headers['Cache-Control']).toBe('private, max-age=0, must-revalidate')
  })

  it('fails closed (503) on a deployment without auth configured', async () => {
    h.missingAuthEnv.mockReturnValue(['BETTER_AUTH_SECRET'])
    const res = await get({ prefix: 'architectures', path: 'fedc/architecture.json' })
    expect(res.statusCode).toBe(503)
    expect(h.getContents).not.toHaveBeenCalled()
  })

  it('stays open off-Vercel without auth configured (local dev)', async () => {
    delete process.env.VERCEL
    h.missingAuthEnv.mockReturnValue(['BETTER_AUTH_SECRET'])
    const res = await get({ prefix: 'architectures', path: 'fedc/architecture.json' })
    expect(res.statusCode).toBe(200)
  })

  it('keeps docs and schemas public with the CDN cache', async () => {
    const docs = await get({ prefix: 'docs', path: 'index.md' })
    expect(docs.statusCode).toBe(200)
    expect(docs.headers['Cache-Control']).toBe('s-maxage=30, stale-while-revalidate=60')
    const schemas = await get({ prefix: 'config/schemas', path: 'architecture.json' })
    expect(schemas.statusCode).toBe(200)
  })
})

describe('/api/content input validation', () => {
  it('rejects unknown prefixes', async () => {
    const res = await get({ prefix: 'secrets', path: 'x.json' })
    expect(res.statusCode).toBe(400)
  })

  it('rejects path traversal', async () => {
    const res = await get({ prefix: 'docs', path: '../config/roles.json' })
    expect(res.statusCode).toBe(400)
    expect(h.getContents).not.toHaveBeenCalled()
  })

  it('rejects absolute paths', async () => {
    const res = await get({ prefix: 'docs', path: '/etc/passwd' })
    expect(res.statusCode).toBe(400)
  })
})
