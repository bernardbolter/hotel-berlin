import { z } from 'zod'

export type ArtistIdentityFieldKey =
  | 'instagram'
  | 'website'
  | 'wikidataId'
  | 'realName'
  | 'nationality'
  | 'basedIn'
  | 'medium'
  | 'shortBio'

/** Identity claims that require the source link to have been opened. */
export const ARTIST_IDENTITY_GATED: ArtistIdentityFieldKey[] = [
  'wikidataId',
  'instagram',
  'website',
  'realName',
]

export const ARTIST_IDENTITY_DEFAULT_CHECKED: ArtistIdentityFieldKey[] = [
  'nationality',
  'basedIn',
  'medium',
  'shortBio',
]

const sourcedString = z.object({
  value: z.string().nullable(),
  source: z.string().nullable(),
})

export const artistAiReplySchema = z.object({
  name: z.string().optional(),
  instagram: sourcedString.optional(),
  website: sourcedString.optional(),
  wikidataId: sourcedString.optional(),
  realName: sourcedString.optional(),
  nationality: sourcedString.optional(),
  basedIn: sourcedString.optional(),
  medium: sourcedString.optional(),
  shortBio: z
    .object({
      de: z.string().nullable(),
      en: z.string().nullable(),
      source: z.string().nullable(),
    })
    .optional(),
})

export type ArtistAiReply = z.infer<typeof artistAiReplySchema>

export function artistIdentityPrompt(name: string): string {
  return `Suche öffentlich verfügbare Angaben zu der Künstlerin oder dem Künstler
„${name}" (Street-Art / Kunst, Berlin).

Sehr wichtig:
- Gib nur an, was du auf einer öffentlichen Quelle tatsächlich findest.
- Zu jeder Angabe gehört die URL, auf der sie steht.
- Was du nicht findest, gibst du als null zurück. Rate nicht.
- Erfinde keine Wikidata-ID. Wenn es keinen Eintrag gibt: null.
- Bei gleichem Namen für mehrere Personen: lieber null als die falsche.

Gib ausschließlich dieses JSON zurück, ohne weiteren Text:

{
  "name": "${name}",
  "instagram":   { "value": null, "source": null },
  "website":     { "value": null, "source": null },
  "wikidataId":  { "value": null, "source": null },
  "realName":    { "value": null, "source": null },
  "nationality": { "value": null, "source": null },
  "basedIn":     { "value": null, "source": null },
  "medium":      { "value": null, "source": null },
  "shortBio":    { "de": null, "en": null, "source": null }
}

"shortBio": ein Satz, höchstens 140 Zeichen, nur Fakten
(was sie machen, seit wann, wo), keine Wertung.`
}

export function stripTrackingParams(url: string): string {
  try {
    const u = new URL(url)
    ;[...u.searchParams.keys()].forEach((key) => {
      if (/^utm_/i.test(key) || key === 'fbclid' || key === 'gclid' || key === 'mc_cid') {
        u.searchParams.delete(key)
      }
    })
    return u.toString()
  } catch {
    return url
  }
}

export function normalizeInstagramHandle(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const fromUrl = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([A-Za-z0-9._]+)\/?/i,
  )
  if (fromUrl) return fromUrl[1]
  if (trimmed.startsWith('@')) return trimmed.slice(1)
  if (/^[A-Za-z0-9._]+$/.test(trimmed)) return trimmed
  return null
}

export function normalizeWebsite(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const u = new URL(withProtocol)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    return stripTrackingParams(u.toString())
  } catch {
    return null
  }
}

export function normalizeWikidataId(value: string): string | null {
  const trimmed = value.trim()
  if (/^Q\d+$/.test(trimmed)) return trimmed
  const fromUrl = trimmed.match(/wikidata\.org\/wiki\/(Q\d+)/i)
  return fromUrl ? fromUrl[1] : null
}

export function parseArtistAiReply(raw: string):
  | { ok: true; data: ArtistAiReply }
  | { ok: false; error: string } {
  let text = raw.trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) text = fence[1].trim()
  try {
    const json = JSON.parse(text) as unknown
    const parsed = artistAiReplySchema.safeParse(json)
    if (!parsed.success) {
      return { ok: false, error: 'malformed' }
    }
    return { ok: true, data: parsed.data }
  } catch {
    return { ok: false, error: 'malformed' }
  }
}

export type ArtistIdentityStatus = {
  key: ArtistIdentityFieldKey
  missing: boolean
  value: string | null
}

export function artistIdentityStatus(artist: {
  instagram?: string | null
  website?: string | null
  wikidataId?: string | null
  realName?: string | null
  nationality?: string | null
  basedIn?: string | null
  medium?: string | null
  shortBio?: string | null
}): ArtistIdentityStatus[] {
  const rows: Array<[ArtistIdentityFieldKey, string | null | undefined]> = [
    ['instagram', artist.instagram],
    ['website', artist.website],
    ['wikidataId', artist.wikidataId],
    ['realName', artist.realName],
    ['nationality', artist.nationality],
    ['basedIn', artist.basedIn],
    ['medium', artist.medium],
    ['shortBio', artist.shortBio],
  ]
  return rows.map(([key, value]) => ({
    key,
    missing: !value?.trim(),
    value: value?.trim() || null,
  }))
}
