import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getClients,
  getClient,
  getVersions,
  getVersion,
  getArtefactData,
  githubAction,
} from './api'

// Mock global fetch; each test sets the next response.
function jsonRes(body, { ok = true, status = 200 } = {}) {
  return { ok, status, json: () => Promise.resolve(body) }
}

beforeEach(() => {
  global.fetch = vi.fn()
})

describe('read endpoints build the flattened /api/arch/ paths', () => {
  it('getClients reads the architectures index and unwraps it', async () => {
    global.fetch.mockResolvedValue(
      jsonRes({ architectures: [{ 'architecture-id': 'fedc' }] })
    )
    const out = await getClients()
    expect(global.fetch).toHaveBeenCalledWith('/api/arch/architectures.json')
    expect(out).toEqual([{ 'architecture-id': 'fedc' }])
  })

  it('getVersions reads transitions.json and unwraps it', async () => {
    global.fetch.mockResolvedValue(jsonRes({ transitions: [{ 'transition-id': 'baseline' }] }))
    const out = await getVersions('fedc')
    expect(global.fetch).toHaveBeenCalledWith('/api/arch/fedc/transitions.json')
    expect(out).toEqual([{ 'transition-id': 'baseline' }])
  })

  it('getVersion reads the transition metadata file', async () => {
    global.fetch.mockResolvedValue(jsonRes({ 'transition-id': 'baseline', name: 'Baseline' }))
    await getVersion('fedc', 'baseline')
    expect(global.fetch).toHaveBeenCalledWith('/api/arch/fedc/baseline/transition.json')
  })

  it('getArtefactData builds the domain/abstraction/id path', async () => {
    global.fetch.mockResolvedValue(jsonRes({}))
    await getArtefactData('fedc', 'baseline', 'business', 'conceptual', 'BUS-CAP')
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/arch/fedc/baseline/domains/business/conceptual/BUS-CAP.json'
    )
  })

  it('returns null on a 404', async () => {
    global.fetch.mockResolvedValue(jsonRes(null, { ok: false, status: 404 }))
    expect(await getClient('missing')).toBeNull()
  })
})

describe('githubAction', () => {
  it('POSTs the body to /api/github and returns the json', async () => {
    global.fetch.mockResolvedValue(jsonRes({ ok: true, architectureId: 'acme' }))
    const out = await githubAction({ action: 'create-architecture', architectureId: 'acme' })
    expect(out).toEqual({ ok: true, architectureId: 'acme' })
    const [url, opts] = global.fetch.mock.calls[0]
    expect(url).toBe('/api/github')
    expect(opts.method).toBe('POST')
    expect(JSON.parse(opts.body)).toMatchObject({ action: 'create-architecture' })
  })

  it('throws the API error message on a non-2xx', async () => {
    global.fetch.mockResolvedValue(jsonRes({ error: 'nope' }, { ok: false, status: 403 }))
    await expect(githubAction({ action: 'x' })).rejects.toThrow('nope')
  })
})
