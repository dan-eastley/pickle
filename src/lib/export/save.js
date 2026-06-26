// Trigger a browser download for a Blob and tidy up the object URL.
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoke on the next tick so the navigation has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Filesystem-safe base name from an artefact/document id and an optional title.
export function safeFileName(...parts) {
  return (
    parts
      .filter(Boolean)
      .join('-')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'export'
  )
}
