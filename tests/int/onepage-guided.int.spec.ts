import { describe, expect, it } from 'vitest'

import {
  combinedArtAiPrompt,
  matchSubjectSuggestions,
  normalizeArtformSuggestion,
  parseCombinedAiReply,
  promptModeLabel,
  resolvePromptMode,
  routeCombinedMediums,
} from '../../src/lib/art/combinedAiReply'
import { ARTIST_IDENTITY_DEFAULT_CHECKED } from '../../src/lib/art/artistIdentity'
import { stripGpsFromJpeg } from '../../src/lib/media/stripGpsFromJpeg'
import { sharpRotateThenStrip } from '../../src/lib/media/sharpRotateThenStrip'
import sharp from 'sharp'

describe('combined AI prompt modes', () => {
  it('uses research mode when a name is known', () => {
    expect(resolvePromptMode('deerBLN')).toBe('with-research')
    const p = combinedArtAiPrompt({ artistName: 'deerBLN', subjectTags: [] })
    expect(p).toContain('„deerBLN"')
    expect(p).toContain('"recherchiert"')
    expect(promptModeLabel('with-research', 'deerBLN', 'de')).toContain('deerBLN')
  })

  it('omits recherchiert entirely when no name is known', () => {
    expect(resolvePromptMode('')).toBe('photo-only')
    const p = combinedArtAiPrompt({ artistName: '', subjectTags: [] })
    expect(p).not.toContain('recherchiert')
    expect(p).toContain('Rate keinen Namen')
    expect(p).toContain('Es gibt noch keine Begriffe')
    expect(promptModeLabel('photo-only', null, 'de')).toBe('Nur Bildbeschreibung')
  })

  it('lists artform codes and bilingual medium/surface', () => {
    const p = combinedArtAiPrompt({ artistName: 'x' })
    expect(p).toContain('mural | graffiti | print | photo | painting | installation | sculpture')
    expect(p).toContain('"medium":  { "de": null, "en": null }')
    expect(p).toContain('"surface": { "de": null, "en": null }')
    expect(p).toContain('Rosa Wandbild')
    expect(p).toContain('Keine Deutung')
    expect(p.toLowerCase()).not.toMatch(/\btitel\b/)
  })

  it('interpolates existing subject slugs and subject rules', () => {
    const p = combinedArtAiPrompt({
      artistName: null,
      subjectTags: [
        { id: 1, slug: 'vogel', name: 'Vogel' },
        { id: 2, slug: 'portrait', name: 'Porträt' },
      ],
    })
    expect(p).toContain('vogel, portrait')
    expect(p).toContain('nicht „bunt"')
    expect(p).toContain('Keine Technik')
    expect(p).toContain('Keine Stile oder Kunstrichtungen')
    expect(p).toContain('eine leere Liste')
  })
})

describe('combined AI paste', () => {
  it('parses gesehen + recherchiert and rejects malformed JSON', () => {
    const ok = parseCombinedAiReply(`\`\`\`json
{
  "gesehen": {
    "altDe": "Vogel am Aufzug",
    "artform": "mural",
    "medium": { "de": "Sprühfarbe", "en": "Spray paint" },
    "subjects": ["vogel", "neu:Kolibri"],
    "signatur": "deer"
  },
  "recherchiert": { "name": { "value": "deerBLN", "source": "https://example.com" } }
}
\`\`\``)
    expect(ok.ok).toBe(true)
    if (ok.ok) {
      expect(ok.data.gesehen?.artform).toBe('mural')
      expect(ok.data.gesehen?.medium?.de).toBe('Sprühfarbe')
      expect(ok.data.gesehen?.signatur).toBe('deer')
      expect(ok.data.recherchiert?.name?.value).toBe('deerBLN')
    }
    expect(parseCombinedAiReply('nope').ok).toBe(false)
  })

  it('accepts only artform codes', () => {
    expect(normalizeArtformSuggestion('mural')).toBe('mural')
    expect(normalizeArtformSuggestion('Mural')).toBe('mural')
    expect(normalizeArtformSuggestion('Gemälde')).toBeNull()
  })

  it('matches subjects by slug; unmatched and neu: become proposals', () => {
    const matched = matchSubjectSuggestions(
      ['vogel', 'neu:Kolibri', 'Schriftzug', 'unknown'],
      [{ id: 1, slug: 'vogel', name: 'Vogel' }],
    )
    expect(matched).toEqual([
      { kind: 'existing', tag: { id: 1, slug: 'vogel', name: 'Vogel' } },
      { kind: 'new', label: 'Kolibri' },
      { kind: 'new', label: 'Schriftzug' },
      { kind: 'new', label: 'unknown' },
    ])
  })

  it('routes gesehen.medium to artwork and recherchiert.medium to artist only', () => {
    const parsed = parseCombinedAiReply(`{
  "gesehen": {
    "medium": { "de": "Sprühfarbe", "en": "Spray paint" }
  },
  "recherchiert": {
    "medium": { "value": "Murals & Installationen", "source": "https://example.com/artist" }
  }
}`)
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    const routed = routeCombinedMediums(parsed.data)
    expect(routed.artwork).toEqual({ de: 'Sprühfarbe', en: 'Spray paint' })
    expect(routed.artist).toEqual({
      value: 'Murals & Installationen',
      source: 'https://example.com/artist',
    })
    // Artist medium is an identity field — never an artwork technique field.
    expect(ARTIST_IDENTITY_DEFAULT_CHECKED).toContain('medium')
    // Applying identity would PATCH artists.medium; artwork uses routed.artwork only.
    expect(routed.artwork?.de).not.toBe(routed.artist?.value)
    expect(routed.artist?.value).not.toMatch(/Sprüh/)
  })
})

describe('EXIF GPS strip + sharp rotate-then-strip', () => {
  it('leaves non-JPEG bytes unchanged', () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
    expect(stripGpsFromJpeg(png)).toBe(png)
  })

  it('applies orientation before emitting a size without metadata', async () => {
    const oriented = await sharp({
      create: { width: 2, height: 1, channels: 3, background: { r: 200, g: 0, b: 0 } },
    })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer()

    const out = await sharpRotateThenStrip(oriented)
    const meta = await sharp(out).metadata()
    expect(meta.orientation).toBeUndefined()
    expect(meta.width).toBe(1)
    expect(meta.height).toBe(2)
  })
})
