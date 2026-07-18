import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RouteErrorBoundary from './RouteErrorBoundary'
import { isStaleDeployError } from '../../lib/chunkError'

function Boom({ message }) {
  throw new Error(message)
}

const CHUNK_MESSAGE = 'Failed to fetch dynamically imported module: /assets/Page-abc.js'
// The init-order TDZ a stale deploy throws, as seen minified in production.
const TDZ_MESSAGE = "Cannot access 'v' before initialization"

describe('isStaleDeployError', () => {
  it('matches the browser variants of a failed dynamic import', () => {
    expect(isStaleDeployError(new Error(CHUNK_MESSAGE))).toBe(true)
    expect(isStaleDeployError(new Error('error loading dynamically imported module'))).toBe(true)
    expect(isStaleDeployError(new Error('Importing a module script failed.'))).toBe(true)
    expect(
      isStaleDeployError(new Error('Failed to load module script: MIME type "text/html"'))
    ).toBe(true)
  })

  it('matches the module init-order (TDZ) variants a stale deploy throws', () => {
    expect(isStaleDeployError(new Error(TDZ_MESSAGE))).toBe(true)
    expect(
      isStaleDeployError(new Error("can't access lexical declaration 'x' before initialization"))
    ).toBe(true)
    expect(isStaleDeployError(new Error('Cannot access uninitialized variable.'))).toBe(true)
  })

  it('does not match ordinary errors', () => {
    expect(isStaleDeployError(new Error('Cannot read properties of undefined'))).toBe(false)
    expect(isStaleDeployError(new Error('x is not a function'))).toBe(false)
    expect(isStaleDeployError(undefined)).toBe(false)
  })

  it('does NOT treat a bare fetch failure as a stale deploy (would mask real errors)', () => {
    // A plain TypeError from a failed API/data fetch must surface as the real
    // error, not the "reloading should fix it" message.
    expect(isStaleDeployError(new TypeError('Failed to fetch'))).toBe(false)
    expect(isStaleDeployError(new Error('NetworkError when attempting to fetch resource.'))).toBe(
      false
    )
    // …but a chunk-load failure that mentions fetch is still caught (it carries
    // the dynamic-import context).
    expect(
      isStaleDeployError(new Error('Failed to fetch dynamically imported module: /assets/x.js'))
    ).toBe(true)
  })
})

describe('RouteErrorBoundary stale-deploy recovery', () => {
  let reload

  beforeEach(() => {
    sessionStorage.clear()
    reload = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload },
      writable: true,
    })
    // React logs caught errors; keep the test output quiet.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('auto-reloads once on the first chunk-load error', () => {
    render(
      <RouteErrorBoundary resetKey="/a">
        <Boom message={CHUNK_MESSAGE} />
      </RouteErrorBoundary>
    )
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('auto-reloads once on the init-order TDZ error (the reported crash)', () => {
    render(
      <RouteErrorBoundary resetKey="/a">
        <Boom message={TDZ_MESSAGE} />
      </RouteErrorBoundary>
    )
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('falls back to the manual prompt when a reload already happened', () => {
    sessionStorage.setItem('stale-deploy-reloaded', '1')
    render(
      <RouteErrorBoundary resetKey="/a">
        <Boom message={TDZ_MESSAGE} />
      </RouteErrorBoundary>
    )
    expect(reload).not.toHaveBeenCalled()
    expect(screen.getByText('This page failed to load.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
  })

  it('does not reload for ordinary render errors', () => {
    render(
      <RouteErrorBoundary resetKey="/a">
        <Boom message="some render bug" />
      </RouteErrorBoundary>
    )
    expect(reload).not.toHaveBeenCalled()
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    expect(screen.getByText('some render bug')).toBeInTheDocument()
  })
})
