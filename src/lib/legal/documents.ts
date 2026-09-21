import type { LegalDocument, LegalSlug } from '@/lib/legal/types'
import { getLegalDocumentFromPayload } from '@/lib/payload/legal'

import cookiesDe from './content/cookies.de.json'
import cookiesEn from './content/cookies.en.json'
import disclaimerDe from './content/disclaimer.de.json'
import disclaimerEn from './content/disclaimer.en.json'
import imprintDe from './content/imprint.de.json'
import imprintEn from './content/imprint.en.json'
import privacyDe from './content/privacy.de.json'
import privacyEn from './content/privacy.en.json'
import termsDe from './content/terms.de.json'
import termsEn from './content/terms.en.json'

const FALLBACK: Record<LegalSlug, { de: LegalDocument; en: LegalDocument }> = {
  imprint: {
    de: imprintDe as LegalDocument,
    en: imprintEn as LegalDocument,
  },
  privacy: {
    de: privacyDe as LegalDocument,
    en: privacyEn as LegalDocument,
  },
  terms: {
    de: termsDe as LegalDocument,
    en: termsEn as LegalDocument,
  },
  cookies: {
    de: cookiesDe as LegalDocument,
    en: cookiesEn as LegalDocument,
  },
  disclaimer: {
    de: disclaimerDe as LegalDocument,
    en: disclaimerEn as LegalDocument,
  },
}

export const LEGAL_SLUGS: LegalSlug[] = [
  'imprint',
  'privacy',
  'terms',
  'cookies',
  'disclaimer',
]

export function getLegalDocumentFallback(slug: LegalSlug, locale: string): LegalDocument {
  const loc = locale === 'de' ? 'de' : 'en'
  const doc = FALLBACK[slug][loc]
  const blocks = [...doc.blocks]
  let lede = doc.lede ?? null

  const first = blocks[0]
  if (first && first.type === 'h4') {
    lede = first.text
    blocks.shift()
  }

  return { ...doc, locale: loc, lede, blocks }
}

export async function getLegalPage(slug: LegalSlug, locale: string): Promise<LegalDocument> {
  const loc = locale === 'de' ? 'de' : 'en'
  try {
    const fromCms = await getLegalDocumentFromPayload(slug, loc)
    if (fromCms) return fromCms
  } catch (error) {
    console.error(`[legal] Payload read failed for ${slug}/${loc}`, error)
  }
  return getLegalDocumentFallback(slug, loc)
}

export function firstParagraphText(doc: LegalDocument): string {
  for (const block of doc.blocks) {
    if (block.type !== 'p') continue
    const text = block.spans
      .map((span) => span.text)
      .join('')
      .replace(/\s+/g, ' ')
      .trim()
    if (text) return text
  }
  return doc.lede?.replace(/\s+/g, ' ').trim() ?? ''
}
