import { describe, it, expect, vi, beforeEach } from 'vitest'

// Integration test for the /api/github handler: exercises the real action
// dispatch + RBAC gating ([RAS-3]) + the create/update wiring ([EDIT-1]/[EDIT-2]),
// with the GitHub client, auth, and DB mocked so no network/DB is touched.

const h = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  selectRows: { value: [] },
  gh: {
    readJson: vi.fn(),
    writeJson: vi.fn(() => Promise.resolve()),
    commitFiles: vi.fn(() => Promise.resolve()),
    cloneDir: vi.fn(() => Promise.resolve()),
  },
  insertValues: vi.fn(() => Promise.resolve()),
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
      Object.assign(this, h.gh)
      this.owner = 'o'
      this.repo = 'r'
    }
  }
  return {
    HttpError,
    GitHubClient,
    getGitHubConfig: () => ({ token: 't', owner: 'o', repo: 'r' }),
    missingGitHubEnv: () => [],
  }
})

vi.mock('../lib/auth', () => ({
  missingAuthEnv: () => [],
  getSessionUser: (...args) => h.getSessionUser(...args),
}))

vi.mock('../db/index', () => {
  // A chainable query stub: builder methods return the chain; awaiting it (or an
  // .onConflictDoUpdate) resolves to the configured rows. `values()` records the
  // inserted row via h.insertValues so create/grant can be asserted.
  const makeChain = () => {
    const c = {}
    for (const m of ['from', 'where', 'innerJoin', 'limit']) c[m] = () => c
    c.values = (v) => (h.insertValues(v), c)
    c.onConflictDoUpdate = () => Promise.resolve()
    c.then = (res, rej) => Promise.resolve(h.selectRows.value).then(res, rej)
    return c
  }
  return { db: { select: makeChain, insert: makeChain, delete: makeChain } }
})

const { default: handler } = await import('./github')

function mockRes() {
  const res = { statusCode: 200, body: undefined }
  res.status = vi.fn((c) => ((res.statusCode = c), res))
  res.json = vi.fn((b) => ((res.body = b), res))
  res.setHeader = vi.fn(() => res)
  res.end = vi.fn(() => res)
  return res
}

async function post(body) {
  const res = mockRes()
  await handler({ method: 'POST', headers: {}, body }, res)
  return res
}

const member = { id: 'u1', email: 'm@x.io', firstName: 'M', accessTier: 'member' }
const admin = { id: 'a1', email: 'a@x.io', firstName: 'A', accessTier: 'admin' }

beforeEach(() => {
  vi.clearAllMocks()
  h.getSessionUser.mockResolvedValue(null)
  h.selectRows.value = []
  process.env.VERCEL = '1'
})

describe('/api/github auth + RBAC gating', () => {
  it('401s an unauthenticated write on Vercel', async () => {
    const res = await post({ action: 'update-architecture', architectureId: 'fedc', name: 'X' })
    expect(res.statusCode).toBe(401)
  })

  it('403s a member with no membership editing an architecture', async () => {
    h.getSessionUser.mockResolvedValue(member)
    const res = await post({ action: 'update-architecture', architectureId: 'fedc', name: 'X' })
    expect(res.statusCode).toBe(403)
    expect(h.gh.writeJson).not.toHaveBeenCalled()
  })

  it('lets an owner edit their architecture', async () => {
    h.getSessionUser.mockResolvedValue(member)
    h.selectRows.value = [{ architectureId: 'fedc', role: 'owner' }]
    h.gh.readJson.mockResolvedValue({ content: { name: 'old' }, sha: 's' })
    const res = await post({ action: 'update-architecture', architectureId: 'fedc', name: 'New' })
    expect(res.statusCode).toBe(200)
    expect(h.gh.writeJson).toHaveBeenCalledOnce()
    expect(h.gh.writeJson.mock.calls[0][0]).toBe('architectures/fedc/architecture.json')
  })
})

describe('/api/github create actions ([EDIT-2])', () => {
  it('any member can create an architecture and is granted owner', async () => {
    h.getSessionUser.mockResolvedValue(member)
    h.gh.readJson.mockResolvedValue({ content: { architectures: [] } })
    const res = await post({ action: 'create-architecture', architectureId: 'acme', name: 'Acme' })
    expect(res.statusCode).toBe(200)
    expect(h.gh.commitFiles).toHaveBeenCalledOnce()
    // owner membership inserted for the creator
    expect(h.insertValues).toHaveBeenCalledOnce()
    expect(h.insertValues.mock.calls[0][0]).toMatchObject({
      userId: 'u1',
      architectureId: 'acme',
      role: 'owner',
    })
  })

  it('rejects a duplicate architecture id with 409', async () => {
    h.getSessionUser.mockResolvedValue(member)
    h.gh.readJson.mockResolvedValue({ content: { architectures: [{ 'architecture-id': 'acme' }] } })
    const res = await post({ action: 'create-architecture', architectureId: 'acme', name: 'Acme' })
    expect(res.statusCode).toBe(409)
    expect(h.gh.commitFiles).not.toHaveBeenCalled()
  })

  it('403s a non-owner member creating a transition', async () => {
    h.getSessionUser.mockResolvedValue(member)
    const res = await post({
      action: 'create-transition',
      architectureId: 'fedc',
      transitionId: '2026-q2',
      name: 'Q2',
    })
    expect(res.statusCode).toBe(403)
    expect(h.gh.cloneDir).not.toHaveBeenCalled()
  })

  it('an admin can create a transition (clones via cloneDir)', async () => {
    h.getSessionUser.mockResolvedValue(admin)
    h.gh.readJson.mockResolvedValue({ content: { transitions: [{ 'transition-id': 'baseline' }] } })
    const res = await post({
      action: 'create-transition',
      architectureId: 'fedc',
      transitionId: '2026-q2',
      name: 'Q2',
      fromTransitionId: 'baseline',
    })
    expect(res.statusCode).toBe(200)
    expect(h.gh.cloneDir).toHaveBeenCalledOnce()
    const [, , from, to] = h.gh.cloneDir.mock.calls[0]
    expect(from).toBe('architectures/fedc/baseline')
    expect(to).toBe('architectures/fedc/2026-q2')
  })
})

describe('/api/github access management ([RAS-3])', () => {
  it('403s a member without the access-grant right', async () => {
    h.getSessionUser.mockResolvedValue(member) // no membership
    const res = await post({
      action: 'grant-access',
      architectureId: 'fedc',
      email: 'new@x.io',
      role: 'contributor',
    })
    expect(res.statusCode).toBe(403)
  })

  it('404s when the email has no user', async () => {
    h.getSessionUser.mockResolvedValue(admin)
    h.selectRows.value = [] // user lookup finds nobody
    const res = await post({
      action: 'grant-access',
      architectureId: 'fedc',
      email: 'ghost@x.io',
      role: 'owner',
    })
    expect(res.statusCode).toBe(404)
  })

  it('grants a role to a known user (admin)', async () => {
    h.getSessionUser.mockResolvedValue(admin)
    h.selectRows.value = [{ id: 'u9', email: 'new@x.io', name: 'New' }]
    const res = await post({
      action: 'grant-access',
      architectureId: 'fedc',
      email: 'new@x.io',
      role: 'contributor',
    })
    expect(res.statusCode).toBe(200)
    expect(res.body.member).toMatchObject({ userId: 'u9', role: 'contributor' })
    expect(h.insertValues).toHaveBeenCalled()
  })

  it('rejects an invalid role with 400', async () => {
    h.getSessionUser.mockResolvedValue(admin)
    h.selectRows.value = [{ id: 'u9', email: 'new@x.io', name: 'New' }]
    const res = await post({
      action: 'grant-access',
      architectureId: 'fedc',
      email: 'new@x.io',
      role: 'superuser',
    })
    expect(res.statusCode).toBe(400)
  })

  it('revokes a membership (admin)', async () => {
    h.getSessionUser.mockResolvedValue(admin)
    const res = await post({ action: 'revoke-access', architectureId: 'fedc', userId: 'u9' })
    expect(res.statusCode).toBe(200)
  })
})
