'use client'

import type { DefaultCellComponentProps } from 'payload'

const contextStyles: Record<string, { background: string; label: string }> = {
  outside: { background: '#F79B2E', label: 'Outside' },
  inside: { background: '#7ab8b0', label: 'Inside' },
  both: { background: '#4a4a6a', label: 'Both' },
}

const ContextBadge = ({ cellData }: DefaultCellComponentProps) => {
  const value = String(cellData ?? '')
  const style = contextStyles[value] ?? { background: '#999', label: value }

  return (
    <span
      style={{
        background: style.background,
        color: '#fff',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 600,
        textTransform: 'uppercase',
      }}
    >
      {style.label}
    </span>
  )
}

export default ContextBadge
