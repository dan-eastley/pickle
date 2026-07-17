import { Component } from 'react'
import { isChunkLoadError } from '../../lib/chunkError'

// Catches render/load errors in the routed content — most importantly a failed
// dynamic import (a stale chunk after a deploy, or a network blip). Resets
// when the route changes, via a `resetKey` passed from the layout.
//
// Stale-chunk recovery: a session that predates the current deployment holds a
// module graph whose hashed chunk URLs no longer exist, so every lazy route
// fails until the page is reloaded. On the first chunk error we reload
// automatically (picking up the current build); a sessionStorage guard makes
// sure a genuinely-broken load degrades to the manual prompt instead of a
// reload loop.

const RELOAD_GUARD_KEY = 'chunk-error-reloaded'

export default class RouteErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    if (!isChunkLoadError(error)) return
    let alreadyReloaded = false
    try {
      alreadyReloaded = sessionStorage.getItem(RELOAD_GUARD_KEY) === '1'
      if (!alreadyReloaded) sessionStorage.setItem(RELOAD_GUARD_KEY, '1')
    } catch {
      // Storage unavailable → skip auto-reload rather than risk a loop.
      alreadyReloaded = true
    }
    if (!alreadyReloaded) window.location.reload()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      // A successful route change means chunks are loading again — clear the
      // guard so a future deploy can auto-recover too.
      try {
        sessionStorage.removeItem(RELOAD_GUARD_KEY)
      } catch {
        /* ignore */
      }
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      const isChunkError = isChunkLoadError(this.state.error)
      return (
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
          <p className="text-sm font-semibold text-error-700">
            {isChunkError ? 'This page failed to load.' : 'Something went wrong.'}
          </p>
          <p className="mt-1 text-sm text-gray-500 max-w-sm">
            {isChunkError
              ? 'The app may have been updated. Reloading should fix it.'
              : this.state.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-1.5 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white transition-colors"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
