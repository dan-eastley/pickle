import { Component } from 'react'

// Catches render/load errors in the routed content — most importantly a failed
// dynamic import (e.g. a stale chunk after a deploy, or a network blip). Resets
// when the route changes, via a `resetKey` passed from the layout.
export default class RouteErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      const isChunkError = /dynamically imported module|importing a module|Failed to fetch/i.test(
        this.state.error.message ?? ''
      )
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
