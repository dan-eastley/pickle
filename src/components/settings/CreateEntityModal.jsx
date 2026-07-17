import { useState } from 'react'
import SettingsModal, { SettingsSection } from '../ui/SettingsModal'

const ID_RE = /^[a-z0-9][a-z0-9-]*$/

// Create an architecture or transition ([EDIT-2]). Collects an id + name (and,
// for a transition, which existing transition to clone from), reusing the shared
// SettingsModal shell. `onSubmit(fields)` performs the write and resolves on
// success; `onCreated(fields)` fires after.
export default function CreateEntityModal({
  title,
  subtitle,
  icon,
  idLabel = 'ID',
  idHint,
  cloneOptions = null, // { label, options: [{value,label}], default } → renders a clone-from select
  onSubmit,
  onCreated,
  onClose,
}) {
  const [id, setId] = useState('')
  const [name, setName] = useState('')
  const [from, setFrom] = useState(cloneOptions?.default ?? cloneOptions?.options?.[0]?.value ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const dirty = !!(id || name)

  const save = async () => {
    if (!ID_RE.test(id)) {
      setError('ID must be lowercase letters, numbers and dashes (e.g. "acme" or "2026-q2").')
      return
    }
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const fields = { id, name: name.trim(), ...(cloneOptions ? { from } : {}) }
      await onSubmit(fields)
      onCreated?.(fields)
      onClose()
    } catch (e) {
      setError(e.message ?? 'Could not create.')
      setSaving(false)
    }
  }

  return (
    <SettingsModal
      title={title}
      subtitle={subtitle}
      icon={icon}
      categories={[{ key: 'details', label: 'Details' }]}
      onClose={onClose}
      onSave={save}
      saving={saving}
      error={error}
      saveLabel="Create"
      dirty={dirty}
    >
      <SettingsSection sectionKey="details" title="Details">
        <label className="block">
          <span className="block text-xs font-medium text-gray-500 mb-1">{idLabel}</span>
          <input
            value={id}
            onChange={(e) => setId(e.target.value.toLowerCase())}
            placeholder="e.g. acme"
            className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white font-mono"
          />
          {idHint && <span className="mt-1 block text-xs text-gray-500">{idHint}</span>}
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-gray-500 mb-1">Display name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
          />
        </label>

        {cloneOptions && (
          <label className="block">
            <span className="block text-xs font-medium text-gray-500 mb-1">
              {cloneOptions.label}
            </span>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
            >
              {cloneOptions.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </SettingsSection>
    </SettingsModal>
  )
}
