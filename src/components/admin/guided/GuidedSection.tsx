import type { ReactNode } from 'react'

type Props = {
  id: string
  title: string
  disabled?: boolean
  children: ReactNode
}

/** Shared guided-entry section chrome (art + hero managers). */
export function GuidedSection({ id, title, disabled, children }: Props) {
  return (
    <section
      aria-labelledby={id}
      style={{
        marginTop: 28,
        opacity: disabled ? 0.45 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      <h2 id={id} style={{ fontSize: 18, margin: '0 0 12px' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

export default GuidedSection
