import { z } from 'zod'

import {
  ARTIST_IDENTITY_DEFAULT_CHECKED,
  ARTIST_IDENTITY_GATED,
  type ArtistIdentityFieldKey,
} from './artistIdentity'
import { ART_ARTFORM_OPTIONS, type ArtworkArtform } from './types'

const sourcedString = z.object({
  value: z.string().nullable(),
  source: z.string().nullable(),
})

const localizedPair = z.object({
  de: z.string().nullable().optional(),
  en: z.string().nullable().optional(),
})

const ARTFORM_CODES = ART_ARTFORM_OPTIONS.map((o) => o.value) as [ArtworkArtform, ...ArtworkArtform[]]

export const combinedAiReplySchema = z.object({
  gesehen: z
    .object({
      altDe: z.string().nullable().optional(),
      altEn: z.string().nullable().optional(),
      artform: z.enum(ARTFORM_CODES).nullable().optional(),
      medium: localizedPair.optional(),
      surface: localizedPair.optional(),
      subjects: z.array(z.string().nullable()).nullable().optional(),
      signatur: z.string().nullable().optional(),
    })
    .optional(),
  recherchiert: z
    .object({
      name: sourcedString.optional(),
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
    .optional(),
})

export type CombinedAiReply = z.infer<typeof combinedAiReplySchema>

export { ARTIST_IDENTITY_DEFAULT_CHECKED, ARTIST_IDENTITY_GATED }
export type { ArtistIdentityFieldKey }

export type SubjectTagOption = {
  id: number
  slug: string
  name: string
}

export type PromptMode = 'with-research' | 'photo-only'

export function resolvePromptMode(artistName?: string | null): PromptMode {
  return artistName?.trim() ? 'with-research' : 'photo-only'
}

export function promptModeLabel(
  mode: PromptMode,
  artistName: string | null | undefined,
  locale: 'de' | 'en' = 'de',
): string {
  if (mode === 'with-research') {
    const name = artistName?.trim() || ''
    return locale === 'en' ? `With research on ${name}` : `Mit Recherche zu ${name}`
  }
  return locale === 'en' ? 'Photo description only' : 'Nur Bildbeschreibung'
}

const SUBJECT_RULES = `- Was dargestellt ist, nicht wie: „Vogel", „Porträt", „Schriftzug",
  „Architektur" — nicht „bunt", „urban", „expressiv".
- Einzahl, ein Wort wenn möglich.
- Keine Künstlernamen, keine Orte, keine Jahreszahlen.
- Keine Technik (die steht schon in „medium").
- Keine Stile oder Kunstrichtungen („Urban Art", „Street Art",
  „abstrakt") — nur was dargestellt ist.
  Lieber keinen Begriff als einen ungefähren; eine leere Liste
  ist in Ordnung.`

function subjectsPromptBlock(tags: SubjectTagOption[]): string {
  if (tags.length === 0) {
    return `Motive (subjects):
Es gibt noch keine Begriffe. Schlage 2 bis 5 vor und markiere
alle mit „neu:".
${SUBJECT_RULES}`
  }
  const list = tags.map((t) => t.slug).join(', ')
  return `Motive (subjects):
Wähle 2 bis 5 Begriffe aus dieser Liste: ${list}.
Nur wenn wirklich nichts passt, schlage höchstens einen neuen
Begriff vor und markiere ihn mit „neu:".
${SUBJECT_RULES}`
}

export type CombinedPromptArgs = {
  artistName?: string | null
  subjectTags?: SubjectTagOption[]
}

/** One prompt: gesehen (from the photo) ± recherchiert (from the web). */
export function combinedArtAiPrompt(args: CombinedPromptArgs | string | null = {}): string {
  // Back-compat: combinedArtAiPrompt('deerBLN')
  const opts: CombinedPromptArgs =
    typeof args === 'string' || args == null ? { artistName: args } : args
  const name = opts.artistName?.trim() || ''
  const mode = resolvePromptMode(name)
  const tags = opts.subjectTags ?? []
  const artformList = ARTFORM_CODES.join(' | ')

  const teil1 = `Ich pflege die Website von Hotel Berlin, Berlin. Im Anhang ist das Foto
eines Kunstwerks im oder am Haus.

TEIL 1 — nur aus dem Foto (nichts dazuerfinden):
- Alt-Text auf Deutsch und Englisch: ein Satz, höchstens 120 Zeichen,
  beginnt mit dem Motiv, nicht mit der Wand. Keine Wertung.
  Sag, was es ist und wo es ist, wenn im Foto erkennbar:
  „Rosa Wandbild mit …", nicht nur „Ein rosa Kreis …".
  Keine Deutung: ein Kreis ist ein Kreis, keine Sonne, solange es
  nicht eindeutig ist.
- artform: genau einer dieser Codes, sonst null:
  ${artformList}
- Technik und Untergrund — nur wenn im Foto erkennbar, sonst null.
  Jeweils Deutsch und Englisch:
  "medium":  { "de": null, "en": null },
  "surface": { "de": null, "en": null }
${subjectsPromptBlock(tags)}
${
  mode === 'photo-only'
    ? `Falls im Bild eine Signatur oder ein Tag lesbar ist, gib sie
unter "signatur" wörtlich zurück. Rate keinen Namen.`
    : `- Signatur oder Schriftzug im Bild, falls lesbar, wörtlich.`
}`

  const gesehenJson = `{
  "gesehen": {
    "altDe": null, "altEn": null,
    "artform": null,
    "medium":  { "de": null, "en": null },
    "surface": { "de": null, "en": null },
    "subjects": [],
    "signatur": null
  }`

  if (mode === 'photo-only') {
    return `${teil1}

Gib ausschließlich dieses JSON zurück, ohne weiteren Text:

${gesehenJson}
}`
  }

  return `${teil1}

TEIL 2 — Recherche zu „${name}":
- Nur Angaben, die du auf einer öffentlichen Quelle findest.
- Zu jeder Angabe die URL, auf der sie steht.
- Was du nicht findest: null. Rate nicht.
- Erfinde keine Wikidata-ID. Kein Eintrag vorhanden: null.
- Mehrere Personen mit dem Namen: lieber null als die falsche.

Gib ausschließlich dieses JSON zurück, ohne weiteren Text:

${gesehenJson},
  "recherchiert": {
    "name":        { "value": null, "source": null },
    "instagram":   { "value": null, "source": null },
    "website":     { "value": null, "source": null },
    "wikidataId":  { "value": null, "source": null },
    "realName":    { "value": null, "source": null },
    "nationality": { "value": null, "source": null },
    "basedIn":     { "value": null, "source": null },
    "medium":      { "value": null, "source": null },
    "shortBio":    { "de": null, "en": null, "source": null }
  }
}`
}

export function parseCombinedAiReply(raw: string):
  | { ok: true; data: CombinedAiReply }
  | { ok: false; error: string } {
  let text = raw.trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) text = fence[1].trim()
  try {
    const json = JSON.parse(text) as unknown
    // Soft-normalize gesehen.artform to a controlled code (or null) before zod.
    if (json && typeof json === 'object' && 'gesehen' in json) {
      const g = (json as { gesehen?: { artform?: unknown; medium?: unknown; surface?: unknown } })
        .gesehen
      if (g) {
        if (typeof g.artform === 'string') {
          const code = normalizeArtformSuggestion(g.artform)
          g.artform = code
        }
        // Tolerate legacy string medium/surface from older pastes.
        if (typeof g.medium === 'string') {
          g.medium = { de: g.medium, en: null }
        }
        if (typeof g.surface === 'string') {
          g.surface = { de: g.surface, en: null }
        }
      }
    }
    const parsed = combinedAiReplySchema.safeParse(json)
    if (!parsed.success) return { ok: false, error: 'malformed' }
    return { ok: true, data: parsed.data }
  } catch {
    return { ok: false, error: 'malformed' }
  }
}

/** Accept only controlled artform codes (case-insensitive). */
export function normalizeArtformSuggestion(value: string | null | undefined): ArtworkArtform | null {
  if (!value?.trim()) return null
  const key = value.trim().toLowerCase()
  return (ARTFORM_CODES as readonly string[]).includes(key) ? (key as ArtworkArtform) : null
}

export type MatchedSubject =
  | { kind: 'existing'; tag: SubjectTagOption }
  | { kind: 'new'; label: string }

/**
 * Match model subject strings to vocabulary.
 * Exact slug/name → existing. Anything else (with or without `neu:`) → proposal.
 * Never creates a tag; the UI creates only checked proposals at save.
 */
export function matchSubjectSuggestions(
  raw: Array<string | null | undefined> | null | undefined,
  tags: SubjectTagOption[],
): MatchedSubject[] {
  if (!raw?.length) return []
  const bySlug = new Map(tags.map((t) => [t.slug.toLowerCase(), t]))
  const byName = new Map(tags.map((t) => [t.name.trim().toLowerCase(), t]))
  const out: MatchedSubject[] = []
  const seen = new Set<string>()

  for (const item of raw) {
    if (!item?.trim()) continue
    let token = item.trim().replace(/^["„]|["”]$/g, '')
    const neu = /^neu:\s*/i.exec(token)
    if (neu) token = token.slice(neu[0].length).trim()
    if (!token) continue

    const hit = bySlug.get(token.toLowerCase()) || byName.get(token.toLowerCase())
    if (hit) {
      if (seen.has(`id:${hit.id}`)) continue
      seen.add(`id:${hit.id}`)
      out.push({ kind: 'existing', tag: hit })
      continue
    }

    const key = `new:${token.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ kind: 'new', label: token })
  }
  return out
}

/**
 * Keep gesehen.medium (artwork technique) and recherchiert.medium (artist)
 * on separate tracks — they must never cross.
 */
export function routeCombinedMediums(data: CombinedAiReply): {
  artwork: { de: string; en: string } | null
  artist: { value: string; source: string | null } | null
} {
  const g = data.gesehen?.medium
  const artwork =
    g?.de?.trim() || g?.en?.trim()
      ? { de: g?.de?.trim() || '', en: g?.en?.trim() || '' }
      : null
  const r = data.recherchiert?.medium
  const artist = r?.value?.trim()
    ? { value: r.value.trim(), source: r.source?.trim() || null }
    : null
  return { artwork, artist }
}
