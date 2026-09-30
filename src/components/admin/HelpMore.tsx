'use client'

import { useEffect, useState, type ReactNode } from 'react'

const storageKey = (id: string) => `hb-admin-help-more:${id}`

type Props = {
  id: string
  lead: string
  more: ReactNode
  moreLabel: string
  lessLabel: string
}

/**
 * First two sentences (lead) always visible; the rest behind Mehr/More,
 * remembered in localStorage per `id`.
 */
export function HelpMore({ id, lead, more, moreLabel, lessLabel }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      setOpen(window.localStorage.getItem(storageKey(id)) === '1')
    } catch {
      /* private mode */
    }
  }, [id])

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(storageKey(id), next ? '1' : '0')
      } catch {
        /* ignore */
      }
      return next
    })
  }

  return (
    <div style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--theme-elevation-800)' }}>
      <p style={{ margin: '0 0 4px' }}>{lead}</p>
      {open ? <div style={{ marginBottom: 4 }}>{more}</div> : null}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        style={{
          appearance: 'none',
          border: 0,
          background: 'none',
          padding: 0,
          color: 'var(--theme-text)',
          fontWeight: 600,
          fontSize: 13,
          cursor: 'pointer',
          textDecoration: 'underline',
          textUnderlineOffset: 2,
        }}
      >
        {open ? lessLabel : moreLabel}
      </button>
    </div>
  )
}

export default HelpMore
