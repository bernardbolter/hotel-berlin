export type LegalSlug = 'imprint' | 'privacy' | 'terms' | 'cookies' | 'disclaimer'

export type LegalMark = 'strong' | 'em' | 'underline'

export type LegalSpan = {
  text: string
  href?: string
  marks?: LegalMark[]
}

export type LegalListItem = {
  spans: LegalSpan[]
  children?: LegalBlock[]
}

export type LegalBlock =
  | { type: 'p'; spans: LegalSpan[] }
  | { type: 'h2'; text: string; id?: string }
  | { type: 'h3'; text: string; id?: string }
  | { type: 'h4'; text: string; id?: string }
  | { type: 'ol' | 'ul'; items: LegalListItem[] }

export type LegalDocument = {
  slug: LegalSlug
  locale: 'de' | 'en'
  title: string
  updated?: string | null
  lede?: string | null
  blocks: LegalBlock[]
}
