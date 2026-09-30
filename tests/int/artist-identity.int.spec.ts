import { describe, expect, it } from 'vitest'

import {
  artistIdentityPrompt,
  normalizeInstagramHandle,
  normalizeWebsite,
  normalizeWikidataId,
  parseArtistAiReply,
} from '../../src/lib/art/artistIdentity'

describe('artist identity AI paste', () => {
  it('interpolates the artist name into the prompt', () => {
    expect(artistIdentityPrompt('deerBLN')).toContain('„deerBLN"')
  })

  it('parses fenced JSON and rejects malformed input', () => {
    const ok = parseArtistAiReply(`\`\`\`json
{"name":"deerBLN","instagram":{"value":"deerbln","source":"https://instagram.com/deerbln"}}
\`\`\``)
    expect(ok.ok).toBe(true)

    const bad = parseArtistAiReply('not json')
    expect(bad.ok).toBe(false)
  })

  it('normalizes identity claim formats', () => {
    expect(normalizeWikidataId('Q123')).toBe('Q123')
    expect(normalizeWikidataId('https://www.wikidata.org/wiki/Q123')).toBe('Q123')
    expect(normalizeWikidataId('not-an-id')).toBeNull()

    expect(normalizeInstagramHandle('https://instagram.com/deerbln/')).toBe('deerbln')
    expect(normalizeInstagramHandle('@deerbln')).toBe('deerbln')
    expect(normalizeInstagramHandle('https://twitter.com/x')).toBeNull()

    expect(normalizeWebsite('example.com?utm_source=x')).toBe('https://example.com/')
    expect(normalizeWebsite('not a url !!')).toBeNull()
  })
})
