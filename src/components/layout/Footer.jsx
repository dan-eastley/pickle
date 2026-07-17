import { useState, useEffect } from 'react'
import release from '../../version.json'
import { useAuth } from '../../context/AuthContext'

export default function Footer() {
  const { user } = useAuth()
  const [config, setConfig] = useState(null)

  // The repo/owner/env config is session-gated (and only meaningful when signed
  // in), so only fetch it for an authenticated user — otherwise an anonymous
  // visitor on a public page gets a 401 logged to the console.
  useEffect(() => {
    if (!user) {
      setConfig(null)
      return
    }
    fetch('/api/github?action=config')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setConfig(data)
      })
      .catch(() => {})
  }, [user])

  return (
    <footer className="border-t border-gray-200 mt-auto px-6 py-3 flex items-center gap-4 flex-wrap">
      <span className="text-xs text-gray-500 font-mono font-semibold">{release.version}</span>
      {config?.owner && config?.repo && (
        <>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs text-gray-500 font-mono">
            {config.owner} / {config.repo}
          </span>
        </>
      )}
      {config?.env && <span className="text-xs text-gray-500 font-mono">{config.env}</span>}
      {config?.branchUrl && (
        <a
          href={`https://${config.branchUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 font-mono hover:text-gray-600 transition-colors"
        >
          {config.branchUrl}
        </a>
      )}
    </footer>
  )
}
