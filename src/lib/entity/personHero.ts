import type { NeighbourhoodPlace } from '@/payload-types'

export type HeroQuote = {
  text: string
  /** Set when the quote was borrowed from an endorsement (R4). */
  placeSlug: string | null
  placeName: string | null
}

/**
 * Person pull quote, or the longest endorsement quote among their picks.
 */
export function resolveHeroQuote(
  personQuote: string | null | undefined,
  personId: string | number,
  picks: readonly NeighbourhoodPlace[],
): HeroQuote | null {
  const own = personQuote?.trim()
  if (own) {
    return { text: own, placeSlug: null, placeName: null }
  }

  let best: HeroQuote | null = null
  for (const place of picks) {
    const entry = place.endorsements?.find((e) => {
      const id = typeof e.person === 'object' ? e.person?.id : e.person
      return id === personId
    })
    const q = entry?.quote?.trim()
    if (!q) continue
    if (!best || q.length > best.text.length) {
      best = { text: q, placeSlug: place.slug, placeName: place.name }
    }
  }
  return best
}

export function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] || full
}

/**
 * Walk heading (R2): no "zu Fuß" / "on foot".
 * DE: `{Vorname}s Orte`, or `Orte von {Vorname}` after s/x/z/ß.
 */
export function personWalkHeading(name: string, locale: 'de' | 'en'): string {
  const first = firstName(name)
  if (locale === 'en') {
    const possessive = /s$/i.test(first) ? `${first}'` : `${first}'s`
    return `${possessive} places`
  }
  if (/[sxzß]$/i.test(first)) return `Orte von ${first}`
  return `${first}s Orte`
}
