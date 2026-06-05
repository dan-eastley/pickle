import { useState, useEffect } from 'react'

export default function Footer() {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    fetch('/api/github?action=config')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.owner) setConfig(data) })
      .catch(() => {})
  }, [])

  return (
    <footer className="border-t border-gray-200 mt-auto px-6 py-3 flex items-center gap-4">
      <span className="text-xs text-gray-400 font-mono">
        {config
          ? `${config.owner} / ${config.repo}`
          : 'GITHUB_OWNER / GITHUB_REPO not configured'}
      </span>
    </footer>
  )
}
