import type { ReactNode } from 'react'

type Props = {
  ariaLabel: string
  message: string
  complete?: boolean
  children: ReactNode
}

/** Sticky bottom bar: what's missing + primary actions. */
export function StickyMissingBar({ ariaLabel, message, complete, children }: Props) {
  return (
    <div
      role="region"
      aria-label={ariaLabel}
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 20,
        borderTop: '1px solid var(--theme-elevation-150)',
        background: 'var(--theme-bg)',
        padding: '12px 16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 13,
          flex: '1 1 200px',
          color: complete ? '#1a7f4b' : 'var(--theme-text)',
        }}
      >
        {message}
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{children}</div>
    </div>
  )
}

export default StickyMissingBar
