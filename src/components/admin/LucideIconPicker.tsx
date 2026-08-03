'use client'

import * as LucideIcons from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { TextFieldClientComponent } from 'payload'
import { FieldDescription, FieldError, FieldLabel, useField } from '@payloadcms/ui'
import { useMemo, useState } from 'react'

import iconNames from './data/lucide-icon-names.json'

function IconPreview({ name, size = 16 }: { name: string; size?: number }) {
  const Icon = LucideIcons[name as keyof typeof LucideIcons] as
    | React.ComponentType<LucideProps>
    | undefined
  if (!Icon) return null
  if (typeof Icon !== 'function' && !(typeof Icon === 'object' && '$$typeof' in Icon)) {
    return null
  }
  return <Icon size={size} aria-hidden="true" />
}

export const LucideIconPicker: TextFieldClientComponent = ({ field, path, readOnly }) => {
  const { value, setValue, showError, errorMessage } = useField<string>({ path })
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return (iconNames as string[]).slice(0, 80)
    return (iconNames as string[])
      .filter((name) => name.toLowerCase().includes(q))
      .slice(0, 80)
  }, [query])

  const selected = typeof value === 'string' ? value : ''

  return (
    <div className="field-type text" style={{ marginBottom: '1.5rem' }}>
      <FieldLabel label={field.label} path={path} required={field.required} />
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span
          style={{
            display: 'inline-flex',
            width: 28,
            height: 28,
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            background: 'var(--theme-elevation-50)',
          }}
          aria-hidden="true"
        >
          {selected ? <IconPreview name={selected} /> : null}
        </span>
        <input
          type="text"
          value={open ? query : selected}
          readOnly={Boolean(readOnly)}
          placeholder="Search Lucide icons…"
          onFocus={() => {
            if (readOnly) return
            setOpen(true)
            setQuery(selected)
          }}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          style={{
            flex: 1,
            minHeight: 36,
            padding: '0 0.75rem',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            background: 'var(--theme-input-bg)',
            color: 'var(--theme-text)',
          }}
        />
        {selected && !readOnly ? (
          <button
            type="button"
            onClick={() => {
              setValue('')
              setQuery('')
            }}
            style={{
              minHeight: 36,
              padding: '0 0.75rem',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: 4,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        ) : null}
      </div>

      {open && !readOnly ? (
        <ul
          role="listbox"
          style={{
            maxHeight: 240,
            overflow: 'auto',
            margin: 0,
            padding: 0,
            listStyle: 'none',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: 4,
            background: 'var(--theme-elevation-0)',
          }}
        >
          {filtered.map((name) => (
            <li key={name}>
              <button
                type="button"
                role="option"
                aria-selected={name === selected}
                onClick={() => {
                  setValue(name)
                  setQuery(name)
                  setOpen(false)
                }}
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.45rem 0.75rem',
                  border: 0,
                  background: name === selected ? 'var(--theme-elevation-100)' : 'transparent',
                  color: 'var(--theme-text)',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <IconPreview name={name} />
                <span>{name}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li style={{ padding: '0.75rem', color: 'var(--theme-elevation-500)' }}>No matches</li>
          ) : null}
        </ul>
      ) : null}

      <FieldDescription path={path} description={field.admin?.description} />
      <FieldError path={path} showError={showError} message={errorMessage} />
    </div>
  )
}
