import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import RouteErrorBoundary from './RouteErrorBoundary'
import { isChunkLoadError } from '../../lib/chunkError'

function Boom({ message }) {
  throw new Error(message)
}

const CHUNK_MESSAGE = 'Failed to fetch dynamically imported module: /assets/Page-abc.js'

describe('isChunkLoadError', () => {
  it('matches the browser variants of a failed dynamic import', () => {
    expect(isChunkLoadError(new Error(CHUNK_MESSAGE))).toBe(true)
    expect(isChunkLoadError(new Error('error loading dynamically imported module'))).toBe(true)
    expect(isChunkLoadError(new Error('Importing a module script failed.'))).toBe(true)
    expect(isChunkLoadError(new Error('Failed to load module script: MIME type "text/html"'))).toBe(
      true
    )
  })
  it('does not match ordinary errors', () => {
    expect(isChunkLoadError(new Error('Cannot read properties of undefined'))).toBe(false)
    expect(isChunkLoadError(undefined)).toBe(false)
  })
})

describe('RouteErrorBoundary stale-chunk recovery', () => {
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

  it('auto-reloads once on the first chunk error', () => {
    render(
      <RouteErrorBoundary resetKey="/a">
        <Boom message={CHUNK_MESSAGE} />
      </RouteErrorBoundary>
    )
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('falls back to the manual prompt when a reload already happened', () => {
    sessionStorage.setItem('chunk-error-reloaded', '1')
    render(
      <RouteErrorBoundary resetKey="/a">
        <Boom message={CHUNK_MESSAGE} />
      </RouteErrorBoundary>
    )
    expect(reload).not.toHaveBeenCalled()
    expect(screen.getByText('This page failed to load.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()
  })

  it('does not reload for non-chunk errors', () => {
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
