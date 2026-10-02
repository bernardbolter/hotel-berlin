export type RoomPhotoPromptLocale = 'de' | 'en'

export type RoomPhotoPromptContext = {
  roomName: string
  roomSlug: string
  shotType?: string | null
  isCover?: boolean
  locale?: RoomPhotoPromptLocale
}

/**
 * Prompt for ChatGPT / Claude / etc. Attach the room photo, paste this text,
 * paste the JSON reply back into Rooms Manager.
 */
export function roomPhotoAiPrompt({
  roomName,
  roomSlug,
  shotType = null,
  isCover = false,
  locale = 'de',
}: RoomPhotoPromptContext): string {
  const coverNote =
    locale === 'en'
      ? isCover
        ? 'This is the cover photo (first in the gallery / homepage teaser). Prefer shotType "wide".'
        : 'This is a gallery photo (not necessarily the cover).'
      : isCover
        ? 'Das ist das Titelbild (erstes Foto der Galerie / Startseiten-Teaser). shotType sollte „wide“ sein.'
        : 'Das ist ein Galeriefoto (nicht zwingend das Titelbild).'

  const shotHint =
    shotType && shotType.trim()
      ? locale === 'en'
        ? `Editor hint for shot type (may correct): ${shotType}`
        : `Hinweis der Redaktion zur Aufnahmeart (darfst korrigieren): ${shotType}`
      : locale === 'en'
        ? 'Always set shotType to one of: wide | bed | bath | detail | view (or null if unsure).'
        : 'shotType immer setzen: wide | bed | bath | detail | view (oder null wenn unsicher).'

  if (locale === 'en') {
    return `I maintain the website for Hotel Berlin, Berlin. Attached is a photo of the room
"${roomName}" (slug: ${roomSlug}). Guests see it in the room gallery and possibly on the homepage.

${coverNote}
${shotHint}

Answer only from what is visible in the photo. Invent nothing. What you cannot
recognise with certainty gets the value null.

Return only this JSON, with no text before or after it:

{
  "altDe": "one sentence in German, max 120 characters, starts with the subject, no judgement",
  "altEn": "the same sentence in English, max 120 characters",
  "captionOverrideDe": "German caption, max 3 words",
  "captionOverrideEn": "English caption, max 3 words",
  "shotType": "wide | bed | bath | detail | view | null",
  "fokuspunkt": { "x": 0-100, "y": 0-100 }
}

Rules:
- Never start alt text with "Image of", "Photo of", "Bild von" or "Foto von".
- Focal point = the spot that must stay visible after cropping (percent from left and from top).
- Prefer a person, bed headboard, or distinctive furniture as the focal point — not empty wall.
- Fill BOTH German and English whenever you can describe the photo.
- Captions: always return both captionOverrideDe and captionOverrideEn. Each caption is at most 3 words (e.g. "Garden view", "King bed"). No full sentences.`
  }

  return `Ich pflege die Website von Hotel Berlin, Berlin. Im Anhang ist ein Foto vom Zimmer
„${roomName}“ (Slug: ${roomSlug}). Gäste sehen es in der Zimmergalerie und ggf. auf der Startseite.

${coverNote}
${shotHint}

Antworte nur aus dem, was im Foto zu sehen ist. Erfinde nichts. Was du nicht
sicher erkennst, bekommt den Wert null.

Gib ausschließlich dieses JSON zurück, ohne Text davor oder danach:

{
  "altDe": "ein Satz auf Deutsch, höchstens 120 Zeichen, beginnt mit dem Motiv, keine Wertung",
  "altEn": "derselbe Satz auf Englisch, höchstens 120 Zeichen",
  "captionOverrideDe": "deutsche Bildunterschrift, maximal 3 Wörter",
  "captionOverrideEn": "englische Bildunterschrift, maximal 3 Wörter",
  "shotType": "wide | bed | bath | detail | view | null",
  "fokuspunkt": { "x": 0-100, "y": 0-100 }
}

Regeln:
- Alt-Text nie mit „Bild von“, „Foto von“, „Image of“ oder „Photo of“ beginnen.
- Fokuspunkt = Stelle, die nach dem Zuschneiden sichtbar bleiben muss (Prozent von links und von oben).
- Bevorzuge Person, Kopfteil des Betts oder markantes Möbelstück — keine leere Wand.
- Beide Sprachen ausfüllen, wenn du das Foto beschreiben kannst.
- Bildunterschriften: captionOverrideDe und captionOverrideEn immer beide liefern. Jeweils höchstens 3 Wörter (z. B. „Gartenblick“, „Kingbett“). Keine ganzen Sätze.`
}

export type RoomPhotoAiParsed = {
  altDe?: string
  altEn?: string
  captionDe?: string
  captionEn?: string
  shotType?: 'wide' | 'bed' | 'bath' | 'detail' | 'view' | null
  focalX?: number
  focalY?: number
}

const SHOT = new Set(['wide', 'bed', 'bath', 'detail', 'view'])

function asShot(v: unknown): RoomPhotoAiParsed['shotType'] {
  if (v == null || v === '') return null
  if (typeof v !== 'string') return undefined
  const key = v.trim().toLowerCase()
  const aliases: Record<string, NonNullable<RoomPhotoAiParsed['shotType']>> = {
    wide: 'wide',
    weit: 'wide',
    overview: 'wide',
    bed: 'bed',
    bett: 'bed',
    bath: 'bath',
    bad: 'bath',
    bathroom: 'bath',
    detail: 'detail',
    view: 'view',
    aussicht: 'view',
  }
  return aliases[key] ?? (SHOT.has(key) ? (key as RoomPhotoAiParsed['shotType']) : undefined)
}

function asPct(n: unknown): number | undefined {
  if (typeof n !== 'number' || Number.isNaN(n)) return undefined
  return Math.min(100, Math.max(0, n))
}

function maxThreeWords(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(' ')
}

/**
 * Accepts flat JSON or a Hero-style `{ gesehen: { … } }` wrapper.
 */
export function parseRoomPhotoAiReply(raw: string): RoomPhotoAiParsed | { error: string } {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return { error: 'invalid' }
  }
  if (!data || typeof data !== 'object') return { error: 'invalid' }

  const root = data as Record<string, unknown>
  const g =
    root.gesehen && typeof root.gesehen === 'object'
      ? (root.gesehen as Record<string, unknown>)
      : root

  const fokus = g.fokuspunkt
  const focal =
    fokus && typeof fokus === 'object'
      ? {
          focalX: asPct((fokus as { x?: unknown }).x),
          focalY: asPct((fokus as { y?: unknown }).y),
        }
      : {}

  const altDe = typeof g.altDe === 'string' ? g.altDe.slice(0, 120) : undefined
  const altEn = typeof g.altEn === 'string' ? g.altEn.slice(0, 120) : undefined
  const captionDeRaw =
    typeof g.captionOverrideDe === 'string'
      ? g.captionOverrideDe
      : typeof g.captionDe === 'string'
        ? g.captionDe
        : undefined
  const captionEnRaw =
    typeof g.captionOverrideEn === 'string'
      ? g.captionOverrideEn
      : typeof g.captionEn === 'string'
        ? g.captionEn
        : undefined
  const captionDe = captionDeRaw != null ? maxThreeWords(captionDeRaw) : undefined
  const captionEn = captionEnRaw != null ? maxThreeWords(captionEnRaw) : undefined
  const shotType = asShot(g.shotType)

  if (
    altDe == null &&
    altEn == null &&
    captionDe == null &&
    captionEn == null &&
    shotType === undefined &&
    focal.focalX == null &&
    focal.focalY == null
  ) {
    return { error: 'empty' }
  }

  return {
    ...(altDe != null ? { altDe } : {}),
    ...(altEn != null ? { altEn } : {}),
    ...(captionDe != null ? { captionDe } : {}),
    ...(captionEn != null ? { captionEn } : {}),
    ...(shotType !== undefined ? { shotType } : {}),
    ...(focal.focalX != null && focal.focalY != null
      ? { focalX: focal.focalX, focalY: focal.focalY }
      : {}),
  }
}
