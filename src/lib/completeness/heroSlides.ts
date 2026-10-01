import { partitionIssues, type CompletenessIssue, type CompletenessResult } from './types'

/**
 * Minimal hero-slide shape for completeness (Payload docs or guided form drafts).
 * Localized fields may arrive as a single locale string or as { de, en }.
 */
export type HeroSlideCompletenessInput = {
  image?: number | { id?: number | null } | null
  altText?: string | { de?: string | null; en?: string | null } | null
  /** Explicit locale pair when the form holds both at once. */
  altTextLocales?: { de?: string | null; en?: string | null } | null
  venue?: number | { id?: number | null } | null
  captionOverride?: string | { de?: string | null; en?: string | null } | null
  captionOverrideLocales?: { de?: string | null; en?: string | null } | null
  credit?: string | null
  description?: string | { de?: string | null; en?: string | null } | null
  descriptionLocales?: { de?: string | null; en?: string | null } | null
  keywords?: string | { de?: string | null; en?: string | null } | null
  keywordsLocales?: { de?: string | null; en?: string | null } | null
}

function hasRelation(value: number | { id?: number | null } | null | undefined): boolean {
  if (value == null) return false
  if (typeof value === 'number') return value > 0
  return typeof value.id === 'number' && value.id > 0
}

function localePair(
  single: string | { de?: string | null; en?: string | null } | null | undefined,
  pair: { de?: string | null; en?: string | null } | null | undefined,
): { de: string; en: string } {
  if (pair) {
    return { de: pair.de?.trim() || '', en: pair.en?.trim() || '' }
  }
  if (single && typeof single === 'object') {
    return { de: single.de?.trim() || '', en: single.en?.trim() || '' }
  }
  const s = typeof single === 'string' ? single.trim() : ''
  // Single-locale admin edit: treat as DE (defaultLocale) for blocking checks
  // only when pair is unavailable — guided form always passes pair.
  return { de: s, en: s }
}

function hasCaption(doc: HeroSlideCompletenessInput): boolean {
  if (hasRelation(doc.venue ?? null)) return true
  const cap = localePair(doc.captionOverride, doc.captionOverrideLocales)
  return Boolean(cap.de || cap.en)
}

/**
 * Publish / enable gate for a hero slide.
 * Blocking: photo, alt DE, alt EN.
 * Warnings: caption, credit, description, keywords.
 */
export function checkHeroSlideCompleteness(doc: HeroSlideCompletenessInput): CompletenessResult {
  const issues: CompletenessIssue[] = []

  if (!hasRelation(doc.image ?? null)) {
    issues.push({
      code: 'hero.photo',
      severity: 'blocking',
      field: 'image',
      message: { de: 'Foto fehlt', en: 'Photo is missing' },
    })
  }

  const alt = localePair(doc.altText, doc.altTextLocales)
  if (!alt.de) {
    issues.push({
      code: 'hero.altDe',
      severity: 'blocking',
      field: 'altText.de',
      message: { de: 'Alt-Text Deutsch fehlt', en: 'German alt text is missing' },
    })
  }
  if (!alt.en) {
    issues.push({
      code: 'hero.altEn',
      severity: 'blocking',
      field: 'altText.en',
      message: { de: 'Alt-Text Englisch fehlt', en: 'English alt text is missing' },
    })
  }

  if (!hasCaption(doc)) {
    issues.push({
      code: 'hero.caption',
      severity: 'warning',
      field: 'captionOverride',
      message: {
        de: 'Keine Bildunterschrift (Ort oder eigener Text)',
        en: 'No caption (venue or custom text)',
      },
    })
  }

  if (!doc.credit?.trim()) {
    issues.push({
      code: 'hero.credit',
      severity: 'warning',
      field: 'credit',
      message: { de: 'Bildnachweis fehlt', en: 'Photo credit is missing' },
    })
  }

  const description = localePair(doc.description, doc.descriptionLocales)
  if (!description.de || !description.en) {
    issues.push({
      code: 'hero.description',
      severity: 'warning',
      field: 'description',
      message: { de: 'Beschreibung fehlt', en: 'Description is missing' },
    })
  }

  const keywords = localePair(doc.keywords, doc.keywordsLocales)
  if (!keywords.de || !keywords.en) {
    issues.push({
      code: 'hero.keywords',
      severity: 'warning',
      field: 'keywords',
      message: { de: 'Stichworte fehlen', en: 'Keywords are missing' },
    })
  }

  return partitionIssues(issues)
}

export function canEnableHeroSlide(doc: HeroSlideCompletenessInput): boolean {
  return checkHeroSlideCompleteness(doc).complete
}
