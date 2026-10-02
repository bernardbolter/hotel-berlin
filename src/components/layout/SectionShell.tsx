import type { ElementType, ReactNode } from 'react'

/**
 * Light-section background rhythm — thematic tints from DESIGN.md / tokens.json.
 * Dark / already-tinted bands (hero, meetings, footer, /here hero) stay on their
 * own components and are listed here only so page maps can name every band.
 */
export type SectionBackground =
  | 'dark-hero'
  | 'dark-accent'
  | 'dark-footer'
  | 'here-tan'
  | 'surface'
  | 'neutral-light'
  | 'surface-rooms'
  | 'surface-meetings'
  | 'surface-dining'
  | 'surface-dark'
  | 'surface-neutral'
  | 'amber-light'
  | 'coral-light'
  | 'gold-light'
  | 'green-light'
  | 'teal-light'
  | 'none'

/** Tints that light content sections may take — never a silent default. */
export type LightSectionBackground = Extract<
  SectionBackground,
  | 'surface'
  | 'neutral-light'
  | 'surface-rooms'
  | 'surface-meetings'
  | 'surface-dining'
  | 'surface-neutral'
  | 'amber-light'
  | 'coral-light'
  | 'gold-light'
  | 'green-light'
  | 'teal-light'
  | 'none'
>

const BG_CLASS: Record<SectionBackground, string> = {
  'dark-hero': '',
  'dark-accent': '',
  'dark-footer': '',
  'here-tan': '',
  surface: 'bg-white',
  'neutral-light': 'bg-hbb-bg-subtle',
  'surface-rooms': 'bg-hbb-surface-rooms',
  'surface-meetings': 'bg-hbb-surface-meetings',
  'surface-dining': 'bg-hbb-surface-dining',
  'surface-dark': 'bg-hbb-surface-dark',
  'surface-neutral': 'bg-hbb-surface-neutral',
  'amber-light': 'bg-hbb-amber-light',
  'coral-light': 'bg-hbb-coral-light',
  'gold-light': 'bg-hbb-gold-light',
  'green-light': 'bg-hbb-green-light',
  'teal-light': 'bg-hbb-teal-light',
  none: '',
}

export function sectionBackgroundClass(background: SectionBackground): string {
  return BG_CLASS[background]
}

type SectionShellProps = {
  background: SectionBackground
  children: ReactNode
  className?: string
  /** Landmark when the shell is the section root. Defaults to `div`. */
  as?: 'div' | 'section'
  'aria-labelledby'?: string
}

/**
 * Full-bleed section ground for the light-tint rhythm.
 * Prefer declaring `background` from a per-page const map so adjacent tokens stay auditable.
 */
export function SectionShell({
  background,
  children,
  className = '',
  as,
  'aria-labelledby': ariaLabelledBy,
}: SectionShellProps) {
  const Tag = (as ?? 'div') as ElementType
  const bg = sectionBackgroundClass(background)
  const classes = [bg, className].filter(Boolean).join(' ')

  return (
    <Tag className={classes} {...(ariaLabelledBy ? { 'aria-labelledby': ariaLabelledBy } : {})}>
      {children}
    </Tag>
  )
}
