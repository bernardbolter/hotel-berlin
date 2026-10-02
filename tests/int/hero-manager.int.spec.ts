import { describe, expect, it } from 'vitest'

import {
  heroAiPrompt,
  heroTranslatePrompt,
  heroTranslateTarget,
  matchVenueByName,
  parseHeroAiReply,
} from '../../src/lib/hero/combinedAiReply'
import {
  canEnableHeroSlide,
  checkHeroSlideCompleteness,
} from '../../src/lib/completeness/heroSlides'

describe('hero AI reply', () => {
  it('builds a gesehen-only prompt with venue list (DE)', () => {
    const p = heroAiPrompt({ context: 'homepage', venues: ['Lütze', 'FKKB'], locale: 'de' })
    expect(p).toContain('Startseite')
    expect(p).toContain('Lütze')
    expect(p).toContain('hinweiseDe')
    expect(p).toContain('hinweiseEn')
    expect(p).toContain('hinweiseDe UND hinweiseEn')
    expect(p).not.toContain('recherchiert')
  })

  it('builds an English prompt when locale is en', () => {
    const p = heroAiPrompt({ context: 'here', venues: ['Lütze'], locale: 'en' })
    expect(p).toContain('guest hub')
    expect(p).toContain('hinweiseDe')
    expect(p).toContain('hinweiseEn')
    expect(p).toContain('hinweiseDe AND hinweiseEn')
    expect(p).toContain('altDe')
    expect(p).toContain('altEn')
  })

  it('parses gesehen and truncates long alt with warning', () => {
    const long = 'x'.repeat(140)
    const raw = JSON.stringify({
      gesehen: {
        altDe: long,
        altEn: 'A courtyard.',
        beschreibungDe: 'Hof.',
        beschreibungEn: 'Courtyard.',
        stichworteDe: ['Hof', 'Grün'],
        stichworteEn: ['courtyard', 'green'],
        ortVorschlag: 'Lütze',
        fokuspunkt: { x: 40, y: 55 },
      },
      hinweiseDe: ['Person erkennbar'],
      hinweiseEn: ['Person recognisable'],
    })
    const parsed = parseHeroAiReply(raw)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.altDe?.length).toBe(120)
    expect(parsed.data.truncated).toContain('altDe')
    expect(parsed.data.hinweiseDe).toEqual(['Person erkennbar'])
    expect(parsed.data.hinweiseEn).toEqual(['Person recognisable'])
    expect(parsed.data.hinweiseIncomplete).toBe(false)
  })

  it('falls back legacy hinweise to DE only and marks incomplete', () => {
    const raw = JSON.stringify({
      gesehen: { altDe: 'Hof', altEn: 'Yard' },
      hinweise: ['Only one language note'],
    })
    const parsed = parseHeroAiReply(raw)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.hinweiseDe).toEqual(['Only one language note'])
    expect(parsed.data.hinweiseEn).toEqual([])
    expect(parsed.data.hinweiseIncomplete).toBe(true)
  })

  it('drops EN when it is identical German copy of DE', () => {
    const same = ['Person erkennbar']
    const raw = JSON.stringify({
      gesehen: { altDe: 'Hof', altEn: 'Yard' },
      hinweiseDe: same,
      hinweiseEn: same,
    })
    const parsed = parseHeroAiReply(raw)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.hinweiseDe).toEqual(same)
    expect(parsed.data.hinweiseEn).toEqual([])
    expect(parsed.data.hinweiseIncomplete).toBe(true)
  })

  it('keeps real English hinweiseEn from a full bilingual reply (garden photo)', () => {
    const raw = JSON.stringify({
      gesehen: {
        altDe: 'Terrasse mit Holzdeck',
        altEn: 'Terrace with wooden deck',
        beschreibungDe: 'Innenhof',
        beschreibungEn: 'Courtyard',
        captionOverrideDe: 'Garten',
        captionOverrideEn: 'Garden',
        fokuspunkt: { x: 50, y: 62 },
      },
      hinweiseDe: [
        'Am rechten Bildrand sind Teile von Personen zu sehen',
        'Deutsche Bildunterschrift „Garten“ ist eine Übersetzung',
      ],
      hinweiseEn: [
        'Parts of people are visible at the right edge of the photo',
        "The German caption 'Garten' is a translation of the supplied English caption 'Garden'",
      ],
    })
    const parsed = parseHeroAiReply(raw)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.hinweiseIncomplete).toBe(false)
    expect(parsed.data.hinweiseEn[0]).toMatch(/^Parts of people/)
    expect(parsed.data.hinweiseDe.join('\n')).not.toEqual(parsed.data.hinweiseEn.join('\n'))
  })

  it('reads hinweiseEn when returned as a single string', () => {
    const raw = JSON.stringify({
      gesehen: { altDe: 'Hof', altEn: 'Yard' },
      hinweiseDe: ['Person erkennbar'],
      hinweiseEn: 'Person is recognisable\nCheck rights',
    })
    const parsed = parseHeroAiReply(raw)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.hinweiseDe).toEqual(['Person erkennbar'])
    expect(parsed.data.hinweiseEn).toEqual(['Person is recognisable', 'Check rights'])
    expect(parsed.data.hinweiseIncomplete).toBe(false)
  })

  it('reads paired hinweise rows [{ de, en }]', () => {
    const raw = JSON.stringify({
      gesehen: { altDe: 'Hof', altEn: 'Yard' },
      hinweise: [
        { de: 'Person erkennbar', en: 'Person recognisable' },
        { de: 'Rechte prüfen', en: 'Check rights' },
      ],
    })
    const parsed = parseHeroAiReply(raw)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.hinweiseDe).toEqual(['Person erkennbar', 'Rechte prüfen'])
    expect(parsed.data.hinweiseEn).toEqual(['Person recognisable', 'Check rights'])
    expect(parsed.data.hinweiseIncomplete).toBe(false)
  })

  it('reads hinweise object shape { de, en }', () => {
    const raw = JSON.stringify({
      gesehen: { altDe: 'Hof', altEn: 'Yard' },
      hinweise: { de: ['Person erkennbar'], en: ['Person recognisable'] },
    })
    const parsed = parseHeroAiReply(raw)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.hinweiseDe).toEqual(['Person erkennbar'])
    expect(parsed.data.hinweiseEn).toEqual(['Person recognisable'])
    expect(parsed.data.hinweiseIncomplete).toBe(false)
  })

  it('marks incomplete when only hinweiseDe is present', () => {
    const raw = JSON.stringify({
      gesehen: { altDe: 'Hof', altEn: 'Yard' },
      hinweiseDe: ['Nur Deutsch'],
    })
    const parsed = parseHeroAiReply(raw)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.hinweiseDe).toEqual(['Nur Deutsch'])
    expect(parsed.data.hinweiseEn).toEqual([])
    expect(parsed.data.hinweiseIncomplete).toBe(true)
  })

  it('builds a translate prompt for missing EN fields', () => {
    const p = heroTranslatePrompt(
      {
        altDe: 'Hof mit Bäumen',
        altEn: '',
        descriptionDe: 'Sonniger Hof.',
        descriptionEn: '',
        keywordsDe: 'Hof, Grün',
        keywordsEn: '',
        captionOverrideDe: '',
        captionOverrideEn: '',
        aiNotesDe: 'Keine Person sichtbar',
        aiNotesEn: '',
      },
      'en',
    )
    expect(p).toContain('German to English')
    expect(p).toContain('altDe: Hof mit Bäumen')
    expect(p).toContain('"altEn"')
    expect(p).toContain('"hinweiseEn"')
  })

  it('detects translate target from incomplete pairs', () => {
    expect(
      heroTranslateTarget({
        altDe: 'Hof',
        altEn: '',
        descriptionDe: '',
        descriptionEn: '',
        keywordsDe: '',
        keywordsEn: '',
        captionOverrideDe: '',
        captionOverrideEn: '',
        aiNotesDe: '',
        aiNotesEn: '',
      }),
    ).toBe('en')
  })

  it('includes a drafted caption in the prompt for translation', () => {
    const p = heroAiPrompt({
      context: 'homepage',
      venues: ['Lütze'],
      locale: 'de',
      captionOverrideDe: 'Hof am Abend',
    })
    expect(p).toContain('Hof am Abend')
    expect(p).toContain('captionOverrideDe')
    expect(p).toContain('captionOverrideEn')
  })

  it('requires German caption when only English is drafted', () => {
    const p = heroAiPrompt({
      context: 'eat-and-drink',
      venues: ['Lütze'],
      locale: 'en',
      captionOverrideEn: 'Evening courtyard',
    })
    expect(p).toContain('Evening courtyard')
    expect(p).toContain('MISSING')
    expect(p).toContain('German translation of:')
    expect(p).toMatch(/"captionOverrideEn": "Evening courtyard"/)
  })

  it('parses caption overrides from the AI reply', () => {
    const raw = JSON.stringify({
      gesehen: {
        altDe: 'Hof',
        altEn: 'Yard',
        captionOverrideDe: 'Hof am Abend',
        captionOverrideEn: 'Courtyard at dusk',
      },
      hinweiseDe: ['ok'],
      hinweiseEn: ['ok'],
    })
    const parsed = parseHeroAiReply(raw)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.captionOverrideDe).toBe('Hof am Abend')
    expect(parsed.data.captionOverrideEn).toBe('Courtyard at dusk')
  })

  it('rejects malformed JSON', () => {
    expect(parseHeroAiReply('not json').ok).toBe(false)
  })

  it('accepts keywords as a comma-separated string and string fokus coords', () => {
    const raw = JSON.stringify({
      gesehen: {
        altDe: 'Theke mit Gläsern',
        altEn: 'Bar counter with glasses',
        stichworteDe: 'Bar, Lütze, Interior',
        stichworteEn: 'bar, Lütze, interior',
        fokuspunkt: { x: '42', y: '58' },
        ortVorschlag: 'Lütze',
      },
      hinweiseDe: ['ok'],
      hinweiseEn: ['ok'],
    })
    const parsed = parseHeroAiReply(raw)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.stichworteDe).toEqual(['Bar', 'Lütze', 'Interior'])
    expect(parsed.data.stichworteEn).toEqual(['bar', 'Lütze', 'interior'])
    expect(parsed.data.fokuspunkt).toEqual({ x: 42, y: 58 })
  })

  it('extracts JSON wrapped in prose or a fence with a trailing comma', () => {
    const raw = `Here is the analysis:
\`\`\`json
{
  "gesehen": {
    "altDe": "Frühstückstisch",
    "altEn": "Breakfast table",
  },
  "hinweiseDe": ["ok"],
  "hinweiseEn": ["ok"],
}
\`\`\`
`
    const parsed = parseHeroAiReply(raw)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.altDe).toBe('Frühstückstisch')
    expect(parsed.data.altEn).toBe('Breakfast table')
  })

  it('repairs unescaped quotes inside hinweise strings (place "Lütze")', () => {
    const raw = `{
"gesehen": {
"altDe": "Restaurant mit Bar",
"altEn": "Restaurant with bar",
"ortVorschlag": "Lütze",
"fokuspunkt": { "x": 40, "y": 50 }
},
"hinweiseDe": ["Die Zuordnung zum Ort „Lütze“ ist ein Vorschlag."],
"hinweiseEn": ["The assignment to the place "Lütze" is a suggestion based on the bar."]
}`
    const parsed = parseHeroAiReply(raw)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    expect(parsed.data.ortVorschlag).toBe('Lütze')
    expect(parsed.data.hinweiseEn[0]).toContain('Lütze')
  })

  it('returns a json error code for total garbage', () => {
    const parsed = parseHeroAiReply('not json')
    expect(parsed.ok).toBe(false)
    if (parsed.ok) return
    expect(parsed.error).toBe('json')
  })

  it('matches venue names case-insensitively', () => {
    const hit = matchVenueByName('lüTze', [{ id: 1, name: 'Lütze' }])
    expect(hit?.id).toBe(1)
    expect(matchVenueByName('Nope', [{ id: 1, name: 'Lütze' }])).toBeNull()
  })
})

describe('hero completeness', () => {
  it('blocks without photo or alts', () => {
    const r = checkHeroSlideCompleteness({})
    expect(r.complete).toBe(false)
    expect(r.blocking.map((i) => i.code)).toEqual(
      expect.arrayContaining(['hero.photo', 'hero.altDe', 'hero.altEn']),
    )
  })

  it('allows enable when photo + both alts exist', () => {
    expect(
      canEnableHeroSlide({
        image: 1,
        altTextLocales: { de: 'Hof', en: 'Courtyard' },
      }),
    ).toBe(true)
  })
})
