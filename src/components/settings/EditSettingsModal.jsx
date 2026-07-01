import { useState } from 'react'
import SettingsModal, { SettingsSection } from '../ui/SettingsModal'

// Name + Status settings, shared by architecture and transition editing ([EDIT-1]).
// `statusOptions` is [{ value, label }]; `onSubmit(fields)` performs the write and
// resolves on success. Icon / Colour categories land later ([EDIT-1] deferred).
export default function EditSettingsModal({
  title,
  subtitle,
  icon,
  initialName = '',
  initialStatus = '',
  statusOptions = [],
  onSubmit,
  onSaved,
  onClose,
}) {
  const [name, setName] = useState(initialName)
  const [status, setStatus] = useState(initialStatus)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const dirty = name !== initialName || status !== initialStatus

  const categories = [
    { key: 'name', label: 'Name' },
    ...(statusOptions.length ? [{ key: 'status', label: 'Status' }] : []),
  ]

  const save = async () => {
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const fields = { name: name.trim() }
      if (statusOptions.length) fields.status = status
      await onSubmit(fields)
      onSaved?.(fields)
      onClose()
    } catch (e) {
      setError(e.message ?? 'Could not save changes.')
      setSaving(false)
    }
  }

  return (
    <SettingsModal
      title={title}
      subtitle={subtitle}
      icon={icon}
      categories={categories}
      onClose={onClose}
      onSave={save}
      saving={saving}
      error={error}
      dirty={dirty}
    >
      <SettingsSection sectionKey="name" title="Name">
        <label className="block">
          <span className="block text-xs font-medium text-gray-500 mb-1">Display name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
          />
        </label>
      </SettingsSection>

      {statusOptions.length > 0 && (
        <SettingsSection sectionKey="status" title="Status">
          <label className="block">
            <span className="block text-xs font-medium text-gray-500 mb-1">Lifecycle status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:border-brand-500 bg-white"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </SettingsSection>
      )}
    </SettingsModal>
  )
}
