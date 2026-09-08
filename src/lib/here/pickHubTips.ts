import { rotateByDay } from '@/lib/here/getHubPeople'

export const HUB_TIP_SLUGS = [
  'kaethe-kollwitz-museum',
  'bayerischer-platz',
  'olympiastadion',
  'koenig-galerie',
  'einsunternull',
  'lokal',
  'nobelhart-und-schmutzig',
  'holocaust-memorial',
  'anjoy',
  'einar-und-bert-bookshop',
] as const

export type HubTipPick = {
  placeSlug: string
  endorserSlug: string | null
}

/**
 * Rotate over tips by Berlin date, then fill the visible row without
 * repeating an endorser. Kristiane owns four tips — a naive slice would
 * show four of her cards.
 */
export function pickHubTips<T extends HubTipPick>(
  tips: T[],
  dateKey: string,
  limit = 4,
): T[] {
  const rotated = rotateByDay(tips, dateKey)
  const seen = new Set<string>()
  const picked: T[] = []

  for (const tip of rotated) {
    if (picked.length >= limit) break
    const slug = tip.endorserSlug
    if (slug) {
      if (seen.has(slug)) continue
      seen.add(slug)
    }
    picked.push(tip)
  }

  return picked
}
