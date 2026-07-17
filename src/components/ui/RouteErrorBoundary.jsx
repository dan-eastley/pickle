import { Component } from 'react'
import { isStaleDeployError } from '../../lib/chunkError'

// Catches render/load errors in the routed content. Resets when the route
// changes, via a `resetKey` passed from the layout.
//
// Stale-deploy recovery: a session that predates the current deployment runs a
// module graph mixing old and new chunks — either a lazy route's chunk URL no
// longer exists (a load failure) or a cached chunk evaluates a binding from a
// differently-ordered chunk before it's initialised (a "before initialization"
// TDZ error, seen minified as e.g. "Cannot access 'v' before initialization").
// Both self-heal by reloading onto the current build, so on the first such
// error we reload automatically; a sessionStorage guard makes sure a
// genuinely-broken build degrades to the manual prompt instead of a reload loop.

const RELOAD_GUARD_KEY = 'stale-deploy-reloaded'

export default class RouteErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    if (!isStaleDeployError(error)) return
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
      // A successful route change means the current build is loading again —
      // clear the guard so a future deploy can auto-recover too.
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
      const isStaleDeploy = isStaleDeployError(this.state.error)
      return (
        <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
          <p className="text-sm font-semibold text-error-700">
            {isStaleDeploy ? 'This page failed to load.' : 'Something went wrong.'}
          </p>
          <p className="mt-1 text-sm text-gray-500 max-w-sm">
            {isStaleDeploy
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
