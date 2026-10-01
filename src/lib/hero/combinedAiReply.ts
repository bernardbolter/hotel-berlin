import { z } from 'zod'

const localizedString = z.string().nullable().optional()

export const heroAiReplySchema = z.object({
  gesehen: z
    .object({
      altDe: localizedString,
      altEn: localizedString,
      beschreibungDe: localizedString,
      beschreibungEn: localizedString,
      stichworteDe: z.array(z.string().nullable()).nullable().optional(),
      stichworteEn: z.array(z.string().nullable()).nullable().optional(),
      ortVorschlag: localizedString,
      captionOverrideDe: localizedString,
      captionOverrideEn: localizedString,
      // Returned by the model; not stored on the slide (see brief §5).
      tageszeit: localizedString,
      sichtbarerText: localizedString,
      fokuspunkt: z
        .object({
          x: z.number().nullable().optional(),
          y: z.number().nullable().optional(),
        })
        .nullable()
        .optional(),
      // Coerced in extractHinweise — models often return a string, not an array.
      hinweiseDe: z.unknown().optional(),
      hinweiseEn: z.unknown().optional(),
    })
    .passthrough()
    .optional(),
  /** Preferred: bilingual notes so the admin language switch can show the matching set. */
  hinweiseDe: z.unknown().optional(),
  hinweiseEn: z.unknown().optional(),
  /**
   * Legacy / alternate shapes. Kept as unknown so `{ de, en }` objects do not
   * fail the whole reply — extractHinweise() reads them after parse.
   */
  hinweise: z.unknown().optional(),
})

export type HeroAiReply = z.infer<typeof heroAiReplySchema>

export type HeroPromptContext = 'homepage' | 'here'
export type HeroPromptLocale = 'de' | 'en'

export type HeroPromptArgs = {
  context: HeroPromptContext
  venues: string[]
  /** Admin UI language — prompt wording. Field values (incl. hinweise) stay DE+EN. */
  locale?: HeroPromptLocale
  /** Optional custom caption already typed by the editor — AI should return both languages. */
  captionOverrideDe?: string
  captionOverrideEn?: string
}

export function heroAiPrompt({
  context,
  venues,
  locale = 'de',
  captionOverrideDe = '',
  captionOverrideEn = '',
}: HeroPromptArgs): string {
  const venueList =
    venues.length > 0
      ? venues
          .map((n) => (typeof n === 'string' ? n.trim() : ''))
          .filter(Boolean)
          .join('\n') ||
        (locale === 'en' ? '(no places listed yet)' : '(noch keine Orte hinterlegt)')
      : locale === 'en'
        ? '(no places listed yet)'
        : '(noch keine Orte hinterlegt)'

  const capDe = captionOverrideDe.trim()
  const capEn = captionOverrideEn.trim()
  const captionBlockEn =
    capDe || capEn
      ? `
Custom caption already drafted by the editor (translate the missing language; keep the given one):
${capDe ? `- German: ${capDe}` : '- German: (please provide)'}
${capEn ? `- English: ${capEn}` : '- English: (please provide)'}
Return both captionOverrideDe and captionOverrideEn in the JSON.
`
      : `
If no place fits, you may suggest a short custom caption in both languages via captionOverrideDe / captionOverrideEn; otherwise leave both null.
`

  const captionBlockDe =
    capDe || capEn
      ? `
Eigene Bildunterschrift, schon vom Redakteur entworfen (fehlende Sprache übersetzen, vorhandene behalten):
${capDe ? `- Deutsch: ${capDe}` : '- Deutsch: (bitte ergänzen)'}
${capEn ? `- Englisch: ${capEn}` : '- Englisch: (bitte ergänzen)'}
Gib captionOverrideDe und captionOverrideEn beide im JSON zurück.
`
      : `
Wenn kein Ort passt, kannst du eine kurze eigene Bildunterschrift in beiden Sprachen vorschlagen (captionOverrideDe / captionOverrideEn); sonst beide null.
`

  if (locale === 'en') {
    const pageLabel = context === 'here' ? 'guest hub (/here)' : 'homepage'
    return `I maintain the website for Hotel Berlin, Berlin. Attached is a photo for
the large hero image on the ${pageLabel}. It rotates with other photos there
and is cropped tightly on phones.

IMPORTANT: Every bilingual field must be filled in BOTH languages. That includes
hinweiseDe AND hinweiseEn (same meaning, two languages). Never return only one.
${captionBlockEn}
Answer only from what is visible in the photo. Invent nothing. What you cannot
recognise with certainty gets the value null.

Places in the building you may choose from:
${venueList}

Return only this JSON, with no text before or after it:

{
  "gesehen": {
    "altDe": "one sentence in German, max 120 characters, starts with the subject, no judgement",
    "altEn": "the same sentence in English",
    "beschreibungDe": "one or two sentences in German, max 300 characters: what is visible, light, time of day, mood only if visible",
    "beschreibungEn": "the same in English",
    "stichworteDe": ["5 to 10 German terms a guest might search for"],
    "stichworteEn": ["the same terms in English"],
    "ortVorschlag": "exactly one of the names above, or null",
    "captionOverrideDe": "custom caption German if needed, else null",
    "captionOverrideEn": "custom caption English if needed, else null",
    "tageszeit": "morgens | tagsüber | abends | nachts | null",
    "sichtbarerText": "text in the image, verbatim, or null",
    "fokuspunkt": { "x": 0-100, "y": 0-100 }
  },
  "hinweiseDe": ["Hinweis 1 auf Deutsch", "Hinweis 2 auf Deutsch"],
  "hinweiseEn": ["Note 1 in English", "Note 2 in English"]
}

Rules: never start alt text with "Image of" or "Photo of". Focal point = the
spot that must not be lost after cropping, in percent from the left and from
the top. hinweiseDe = German only; hinweiseEn = English only; both arrays
required with the same points. If a person is recognisable, say so in both.
hinweiseEn must be written in English (not German). Always fill both German and
English text fields when you can describe the photo.`
  }

  const pageLabel = context === 'here' ? 'Gästeseite' : 'Startseite'
  return `Ich pflege die Website von Hotel Berlin, Berlin. Im Anhang ist ein Foto für
das große Titelbild der ${pageLabel}. Es läuft dort im Wechsel
mit anderen Fotos und wird auf dem Handy stark zugeschnitten.

WICHTIG: Alle zweisprachigen Felder müssen in BEIDEN Sprachen ausgefüllt
werden. Das gilt auch für hinweiseDe UND hinweiseEn (gleicher Sinn, zwei
Sprachen). Niemals nur eine Sprache zurückgeben.
${captionBlockDe}
Antworte nur aus dem, was im Foto zu sehen ist. Erfinde nichts. Was du nicht
sicher erkennst, bekommt den Wert null.

Orte im Haus, aus denen du wählen darfst:
${venueList}

Gib ausschließlich dieses JSON zurück, ohne Text davor oder danach:

{
  "gesehen": {
    "altDe": "ein Satz, höchstens 120 Zeichen, beginnt mit dem Motiv, keine Wertung",
    "altEn": "derselbe Satz auf Englisch",
    "beschreibungDe": "ein bis zwei Sätze, höchstens 300 Zeichen: was ist zu sehen, Licht, Tageszeit, Stimmung nur wenn sichtbar",
    "beschreibungEn": "dasselbe auf Englisch",
    "stichworteDe": ["5 bis 10 Begriffe, die ein Gast suchen würde"],
    "stichworteEn": ["dieselben Begriffe auf Englisch"],
    "ortVorschlag": "genau einer der Namen oben, oder null",
    "captionOverrideDe": "eigene Bildunterschrift Deutsch falls nötig, sonst null",
    "captionOverrideEn": "eigene Bildunterschrift Englisch falls nötig, sonst null",
    "tageszeit": "morgens | tagsüber | abends | nachts | null",
    "sichtbarerText": "Schrift im Bild, wortgetreu, oder null",
    "fokuspunkt": { "x": 0-100, "y": 0-100 }
  },
  "hinweiseDe": ["Hinweis 1 auf Deutsch", "Hinweis 2 auf Deutsch"],
  "hinweiseEn": ["Note 1 in English", "Note 2 in English"]
}

Regeln: Alt-Text nie mit "Bild von" oder "Foto von" beginnen. Fokuspunkt =
die Stelle, die nach dem Zuschneiden auf keinen Fall fehlen darf, in Prozent
von links und von oben. hinweiseDe nur Deutsch, hinweiseEn nur Englisch —
beide Arrays Pflicht, gleicher Inhalt. Wenn eine Person erkennbar ist,
schreibe das in beide. hinweiseEn muss auf Englisch sein (nicht Deutsch).
Fülle deutsche und englische Textfelder immer beide,
wenn du das Foto beschreiben kannst.`
}

function clampKeywords(raw: Array<string | null> | null | undefined): string[] {
  if (!raw?.length) return []
  const out: string[] = []
  for (const item of raw) {
    const t = item?.trim()
    if (!t) continue
    if (out.some((x) => x.toLowerCase() === t.toLowerCase())) continue
    out.push(t)
    if (out.length >= 12) break
  }
  return out
}

function clampHinweise(raw: Array<string | null> | null | undefined): string[] {
  if (!raw?.length) return []
  return raw.map((h) => h?.trim()).filter((h): h is string => Boolean(h))
}

export type ParsedHeroAiReply = {
  altDe: string | null
  altEn: string | null
  beschreibungDe: string | null
  beschreibungEn: string | null
  stichworteDe: string[]
  stichworteEn: string[]
  ortVorschlag: string | null
  captionOverrideDe: string | null
  captionOverrideEn: string | null
  sichtbarerText: string | null
  fokuspunkt: { x: number; y: number } | null
  hinweiseDe: string[]
  hinweiseEn: string[]
  /** True when notes exist in only one language — editor should re-apply a full reply. */
  hinweiseIncomplete: boolean
  /** Fields truncated to max length — show a visible warning in the UI. */
  truncated: Array<'altDe' | 'altEn' | 'beschreibungDe' | 'beschreibungEn'>
}

function trimCap(
  value: string | null | undefined,
  max: number,
  key: ParsedHeroAiReply['truncated'][number],
  truncated: ParsedHeroAiReply['truncated'],
): string | null {
  if (!value?.trim()) return null
  const t = value.trim()
  if (t.length > max) {
    truncated.push(key)
    return t.slice(0, max)
  }
  return t
}

function asHinweisArray(value: unknown): string[] {
  if (value == null) return []
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    // Single blob or newline-separated notes
    return clampHinweise(trimmed.split(/\n+/))
  }
  if (Array.isArray(value)) {
    // ["note"] or [{ de, en }, ...]
    if (
      value.length &&
      value.every((row) => row && typeof row === 'object' && !Array.isArray(row))
    ) {
      return [] // paired rows handled in extractHinweise
    }
    return clampHinweise(
      value.map((row) => {
        if (typeof row === 'string') return row
        if (row == null) return null
        return String(row)
      }),
    )
  }
  return []
}

function pairedHinweise(value: unknown): { de: string[]; en: string[] } | null {
  if (!Array.isArray(value) || !value.length) return null
  if (!value.every((row) => row && typeof row === 'object' && !Array.isArray(row))) {
    return null
  }
  const de: string[] = []
  const en: string[] = []
  for (const row of value as Array<Record<string, unknown>>) {
    const d = row.de ?? row.De ?? row.hinweiseDe ?? row.deutsch ?? row.German
    const e = row.en ?? row.En ?? row.hinweiseEn ?? row.englisch ?? row.English
    if (typeof d === 'string' && d.trim()) de.push(d.trim())
    if (typeof e === 'string' && e.trim()) en.push(e.trim())
  }
  if (!de.length && !en.length) return null
  return { de, en }
}

function pickHinweisField(obj: Record<string, unknown>, side: 'de' | 'en'): unknown {
  if (side === 'de') {
    return (
      obj.hinweiseDe ??
      obj.de ??
      obj.De ??
      obj.deutsch ??
      obj.German ??
      obj.notesDe ??
      obj.hintsDe
    )
  }
  return (
    obj.hinweiseEn ??
    obj.en ??
    obj.En ??
    obj.englisch ??
    obj.English ??
    obj.notesEn ??
    obj.hintsEn
  )
}

/**
 * Pull bilingual notes from the shapes models actually return:
 * - hinweiseDe / hinweiseEn (top-level or inside gesehen; array or string)
 * - hinweise: { de, en } or { hinweiseDe, hinweiseEn }
 * - hinweise: [{ de, en }, ...] paired rows
 * - hinweise: ["…"] legacy single list (DE only — do not copy into EN)
 */
function extractHinweise(data: {
  hinweiseDe?: unknown
  hinweiseEn?: unknown
  hinweise?: unknown
  gesehen?: Record<string, unknown> | null
}): { de: string[]; en: string[]; incomplete: boolean } {
  let de = asHinweisArray(data.hinweiseDe)
  let en = asHinweisArray(data.hinweiseEn)

  const g = data.gesehen
  if (g) {
    if (!de.length) de = asHinweisArray(pickHinweisField(g, 'de'))
    if (!en.length) en = asHinweisArray(pickHinweisField(g, 'en'))
  }

  const h = data.hinweise
  const paired = pairedHinweise(h)
  if (paired) {
    if (!de.length) de = paired.de
    if (!en.length) en = paired.en
  } else if (h && typeof h === 'object' && !Array.isArray(h)) {
    const obj = h as Record<string, unknown>
    if (!de.length) de = asHinweisArray(pickHinweisField(obj, 'de'))
    if (!en.length) en = asHinweisArray(pickHinweisField(obj, 'en'))
  } else if (!de.length && !en.length && Array.isArray(h)) {
    // Legacy single array — keep as DE only so EN is not falsely filled with German.
    de = asHinweisArray(h)
  }

  // Models often paste the same German lines into hinweiseEn — treat as missing EN.
  const norm = (lines: string[]) =>
    lines
      .map((l) => l.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('\n')
  if (de.length && en.length && norm(de) === norm(en)) {
    en = []
  }

  const incomplete =
    (de.length > 0 && en.length === 0) || (en.length > 0 && de.length === 0)

  return { de, en, incomplete }
}

export function parseHeroAiReply(
  raw: string,
): { ok: true; data: ParsedHeroAiReply } | { ok: false; error: string } {
  let text = raw.trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) text = fence[1].trim()
  try {
    const json = JSON.parse(text) as Record<string, unknown>
    const parsed = heroAiReplySchema.safeParse(json)
    if (!parsed.success) return { ok: false, error: 'malformed' }
    const g = parsed.data.gesehen
    const truncated: ParsedHeroAiReply['truncated'] = []
    const fokus = g?.fokuspunkt
    let fokuspunkt: { x: number; y: number } | null = null
    if (fokus && typeof fokus.x === 'number' && typeof fokus.y === 'number') {
      fokuspunkt = {
        x: Math.min(100, Math.max(0, fokus.x)),
        y: Math.min(100, Math.max(0, fokus.y)),
      }
    }

    const stichworteDe = clampKeywords(g?.stichworteDe)
    const stichworteEn = clampKeywords(g?.stichworteEn)
    // Read hinweise from the raw JSON object (not only zod output) so top-level
    // hinweiseEn is never dropped by schema quirks.
    const rawGesehen =
      json.gesehen && typeof json.gesehen === 'object' && !Array.isArray(json.gesehen)
        ? (json.gesehen as Record<string, unknown>)
        : null
    const notes = extractHinweise({
      hinweiseDe: json.hinweiseDe ?? parsed.data.hinweiseDe,
      hinweiseEn: json.hinweiseEn ?? parsed.data.hinweiseEn,
      hinweise: json.hinweise ?? parsed.data.hinweise,
      gesehen: rawGesehen ?? (g as Record<string, unknown> | null | undefined) ?? null,
    })

    const rawAltEn =
      typeof rawGesehen?.altEn === 'string' ? rawGesehen.altEn : g?.altEn
    const rawAltDe =
      typeof rawGesehen?.altDe === 'string' ? rawGesehen.altDe : g?.altDe
    const rawDescEn =
      typeof rawGesehen?.beschreibungEn === 'string'
        ? rawGesehen.beschreibungEn
        : g?.beschreibungEn
    const rawDescDe =
      typeof rawGesehen?.beschreibungDe === 'string'
        ? rawGesehen.beschreibungDe
        : g?.beschreibungDe

    return {
      ok: true,
      data: {
        altDe: trimCap(rawAltDe, 120, 'altDe', truncated),
        altEn: trimCap(rawAltEn, 120, 'altEn', truncated),
        beschreibungDe: trimCap(rawDescDe, 300, 'beschreibungDe', truncated),
        beschreibungEn: trimCap(rawDescEn, 300, 'beschreibungEn', truncated),
        stichworteDe,
        stichworteEn,
        ortVorschlag: g?.ortVorschlag?.trim() || null,
        captionOverrideDe: g?.captionOverrideDe?.trim() || null,
        captionOverrideEn: g?.captionOverrideEn?.trim() || null,
        // tageszeit intentionally ignored — model may return it; not stored (brief §5).
        sichtbarerText: g?.sichtbarerText?.trim() || null,
        fokuspunkt,
        hinweiseDe: notes.de,
        hinweiseEn: notes.en,
        hinweiseIncomplete: notes.incomplete,
        truncated,
      },
    }
  } catch {
    return { ok: false, error: 'malformed' }
  }
}

export function matchVenueByName(
  suggestion: string | null | undefined,
  venues: Array<{ id: number; name: string }>,
): { id: number; name: string } | null {
  if (!suggestion?.trim()) return null
  const key = suggestion.trim().toLowerCase()
  return venues.find((v) => v.name.trim().toLowerCase() === key) ?? null
}

export function keywordsToField(items: string[]): string {
  return items.join(', ')
}

export function fieldToKeywords(value: string): string[] {
  return value
    .split(/[,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export type HeroTranslateSource = {
  altDe: string
  altEn: string
  descriptionDe: string
  descriptionEn: string
  keywordsDe: string
  keywordsEn: string
  captionOverrideDe: string
  captionOverrideEn: string
  aiNotesDe: string
  aiNotesEn: string
}

export type HeroTranslateTarget = 'de' | 'en'

/** Which language still has empty counterparts that can be filled from the other. */
export function heroTranslateTarget(source: HeroTranslateSource): HeroTranslateTarget | null {
  const needEn =
    (Boolean(source.altDe.trim()) && !source.altEn.trim()) ||
    (Boolean(source.descriptionDe.trim()) && !source.descriptionEn.trim()) ||
    (Boolean(source.keywordsDe.trim()) && !source.keywordsEn.trim()) ||
    (Boolean(source.captionOverrideDe.trim()) && !source.captionOverrideEn.trim()) ||
    (Boolean(source.aiNotesDe.trim()) && !source.aiNotesEn.trim())
  const needDe =
    (Boolean(source.altEn.trim()) && !source.altDe.trim()) ||
    (Boolean(source.descriptionEn.trim()) && !source.descriptionDe.trim()) ||
    (Boolean(source.keywordsEn.trim()) && !source.keywordsDe.trim()) ||
    (Boolean(source.captionOverrideEn.trim()) && !source.captionOverrideDe.trim()) ||
    (Boolean(source.aiNotesEn.trim()) && !source.aiNotesDe.trim())

  // Prefer filling EN from DE when both directions have work; matches DE-first admin.
  if (needEn) return 'en'
  if (needDe) return 'de'
  return null
}

export function heroTranslatePrompt(
  source: HeroTranslateSource,
  target: HeroTranslateTarget,
): string {
  const from = target === 'en' ? 'German' : 'English'
  const to = target === 'en' ? 'English' : 'German'
  const lines: string[] = []

  const push = (label: string, value: string) => {
    if (value.trim()) lines.push(`${label}: ${value.trim()}`)
  }

  if (target === 'en') {
    push('altDe', source.altDe)
    push('beschreibungDe', source.descriptionDe)
    push('stichworteDe', source.keywordsDe)
    push('captionOverrideDe', source.captionOverrideDe)
    if (source.aiNotesDe.trim()) {
      lines.push(
        `hinweiseDe:\n${source.aiNotesDe
          .split('\n')
          .map((l) => `- ${l.trim()}`)
          .filter((l) => l !== '-')
          .join('\n')}`,
      )
    }
  } else {
    push('altEn', source.altEn)
    push('beschreibungEn', source.descriptionEn)
    push('stichworteEn', source.keywordsEn)
    push('captionOverrideEn', source.captionOverrideEn)
    if (source.aiNotesEn.trim()) {
      lines.push(
        `hinweiseEn:\n${source.aiNotesEn
          .split('\n')
          .map((l) => `- ${l.trim()}`)
          .filter((l) => l !== '-')
          .join('\n')}`,
      )
    }
  }

  const needAlt =
    target === 'en'
      ? !source.altEn.trim() && Boolean(source.altDe.trim())
      : !source.altDe.trim() && Boolean(source.altEn.trim())
  const needDesc =
    target === 'en'
      ? !source.descriptionEn.trim() && Boolean(source.descriptionDe.trim())
      : !source.descriptionDe.trim() && Boolean(source.descriptionEn.trim())
  const needKw =
    target === 'en'
      ? !source.keywordsEn.trim() && Boolean(source.keywordsDe.trim())
      : !source.keywordsDe.trim() && Boolean(source.keywordsEn.trim())
  const needCap =
    target === 'en'
      ? !source.captionOverrideEn.trim() && Boolean(source.captionOverrideDe.trim())
      : !source.captionOverrideDe.trim() && Boolean(source.captionOverrideEn.trim())
  const needNotes =
    target === 'en'
      ? !source.aiNotesEn.trim() && Boolean(source.aiNotesDe.trim())
      : !source.aiNotesDe.trim() && Boolean(source.aiNotesEn.trim())

  const outKeys: string[] = []
  if (needAlt) outKeys.push(target === 'en' ? `"altEn": "…" (max 120)"` : `"altDe": "…" (max 120)"`)
  if (needDesc) {
    outKeys.push(
      target === 'en' ? `"beschreibungEn": "…" (max 300)"` : `"beschreibungDe": "…" (max 300)"`,
    )
  }
  if (needKw) {
    outKeys.push(target === 'en' ? `"stichworteEn": ["…", "…"]` : `"stichworteDe": ["…", "…"]`)
  }
  if (needCap) {
    outKeys.push(target === 'en' ? `"captionOverrideEn": "…"` : `"captionOverrideDe": "…"`)
  }
  if (needNotes) {
    outKeys.push(target === 'en' ? `"hinweiseEn": ["…"]` : `"hinweiseDe": ["…"]`)
  }

  return `Translate the following Hotel Berlin hero CMS fields from ${from} to ${to}.
Keep meaning, tone, and length limits. Do not invent new facts. Return only JSON.

Source (${from}):
${lines.join('\n') || '(nothing to translate)'}

Return only this JSON, with no text before or after it:
{
  ${outKeys.join(',\n  ')}
}`
}

export const heroTranslateReplySchema = z.object({
  altDe: localizedString,
  altEn: localizedString,
  beschreibungDe: localizedString,
  beschreibungEn: localizedString,
  stichworteDe: z.array(z.string().nullable()).nullable().optional(),
  stichworteEn: z.array(z.string().nullable()).nullable().optional(),
  captionOverrideDe: localizedString,
  captionOverrideEn: localizedString,
  hinweiseDe: z.unknown().optional(),
  hinweiseEn: z.unknown().optional(),
})

export type ParsedHeroTranslateReply = {
  altDe: string | null
  altEn: string | null
  beschreibungDe: string | null
  beschreibungEn: string | null
  stichworteDe: string[]
  stichworteEn: string[]
  captionOverrideDe: string | null
  captionOverrideEn: string | null
  hinweiseDe: string[]
  hinweiseEn: string[]
  truncated: Array<'altDe' | 'altEn' | 'beschreibungDe' | 'beschreibungEn'>
}

export function parseHeroTranslateReply(
  raw: string,
): { ok: true; data: ParsedHeroTranslateReply } | { ok: false; error: string } {
  let text = raw.trim()
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence) text = fence[1].trim()
  try {
    const json = JSON.parse(text) as unknown
    const parsed = heroTranslateReplySchema.safeParse(json)
    if (!parsed.success) return { ok: false, error: 'malformed' }
    const truncated: ParsedHeroTranslateReply['truncated'] = []
    return {
      ok: true,
      data: {
        altDe: trimCap(parsed.data.altDe, 120, 'altDe', truncated),
        altEn: trimCap(parsed.data.altEn, 120, 'altEn', truncated),
        beschreibungDe: trimCap(parsed.data.beschreibungDe, 300, 'beschreibungDe', truncated),
        beschreibungEn: trimCap(parsed.data.beschreibungEn, 300, 'beschreibungEn', truncated),
        stichworteDe: clampKeywords(parsed.data.stichworteDe),
        stichworteEn: clampKeywords(parsed.data.stichworteEn),
        captionOverrideDe: parsed.data.captionOverrideDe?.trim() || null,
        captionOverrideEn: parsed.data.captionOverrideEn?.trim() || null,
        hinweiseDe: asHinweisArray(parsed.data.hinweiseDe),
        hinweiseEn: asHinweisArray(parsed.data.hinweiseEn),
        truncated,
      },
    }
  } catch {
    return { ok: false, error: 'malformed' }
  }
}
