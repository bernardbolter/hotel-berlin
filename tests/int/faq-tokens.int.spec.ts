import { describe, expect, it } from 'vitest'

import { buildFAQPageGraph } from '../../src/lib/aeo-schema/src/builders/faq'
import {
  extractFaqTokens,
  FAQ_TOKEN_DEFS,
  hasFaqBracketMarker,
  isKnownFaqToken,
  resolveFaqTokens,
  type TokenContext,
} from '../../src/lib/faq/tokens'
import { faqPublishBracketGuard, faqTokenTypoGuard } from '../../src/lib/faq/hooks'

const baseHotel = {
  checkinTime: '15:00',
  checkoutTime: '12:00',
  email: 'info@hotel-berlin.de',
  petFee: 30,
  earlyCheckin: { from: '06:00', fee: 30 },
  parking: { spaces: 208, hourly: 4, dailyMax: 25, maxHeight: 1.8 },
  breakfastPricing: { adultPrice: 23, childAgeFrom: 6 },
  guestStay: { breakfast: { valueEN: '06:30–10:00', valueDE: '06:30–10:00' } },
  address: {
    streetAddress: 'Lützowplatz 17',
    postalCode: '10785',
    addressLocality: 'Berlin',
  },
  ratePolicy: { flexibleCancelUntil: '18:00', noShowPercent: 90 },
  smokingFee: 250,
  roomPhoneRates: { domestic: 0.4, intlMin: 0.8, intlMax: 3.2 },
  telephone: '+49 30 26050',
  receptionPhone: '+49 30 2605 3103',
  guestStayWifi: 'HBB-Guestconnect',
} as unknown as NonNullable<TokenContext['hotel']>

function ctx(overrides: Partial<TokenContext> = {}): TokenContext {
  return {
    hotel: baseHotel,
    amenitiesBySlug: new Map([
      ['sauna', { slug: 'sauna', noticeMinutes: 45 } as never],
    ]),
    roomsBySlug: new Map(),
    ...overrides,
  }
}

describe('FAQ tokens', () => {
  it('replaces known tokens with locale formats', () => {
    const en = resolveFaqTokens('Fee {{petFee}} height {{parkingMaxHeight}}', 'en', ctx())
    expect(en.text).toBe('Fee €30 height 1.80 m')
    expect(en.unresolved).toEqual([])
    const de = resolveFaqTokens('Gebühr {{petFee}} Höhe {{parkingMaxHeight}}', 'de', ctx())
    expect(de.text).toBe('Gebühr 30 € Höhe 1,80 m')
  })

  it('detects unresolved tokens when source is empty', () => {
    const empty = ctx({
      hotel: { ...baseHotel, petFee: null } as never,
    })
    const r = resolveFaqTokens('Pets {{petFee}}', 'en', empty)
    expect(r.unresolved).toContain('petFee')
    expect(r.text).toContain('{{petFee}}')
  })

  it('HOLD tokens never resolve even when hotel fields are set', () => {
    for (const name of ['wifiSsid', 'saunaHours', 'phoneMain', 'phoneReception']) {
      expect(FAQ_TOKEN_DEFS[name].hold).toBe(true)
      const r = resolveFaqTokens(`X {{${name}}}`, 'en', ctx())
      expect(r.unresolved).toContain(name)
      expect(r.text).toBe(`X {{${name}}}`)
    }
  })

  it('returns answers with no tokens unchanged', () => {
    const plain = 'Check-in is from 15:00.'
    const r = resolveFaqTokens(plain, 'en', ctx())
    expect(r.text).toBe(plain)
    expect(r.unresolved).toEqual([])
  })

  it('typo guard rejects unknown tokens', () => {
    expect(isKnownFaqToken('petFee')).toBe(true)
    expect(isKnownFaqToken('petFEe')).toBe(false)
    expect(() =>
      faqTokenTypoGuard({
        data: { question: 'What about {{petFee}}?', answer: 'It is {{petFEe}}.' },
      } as never),
    ).toThrow(/Unknown FAQ token/)
  })

  it('publish guard blocks bracket markers', () => {
    expect(hasFaqBracketMarker('Please [CONFIRM with hotel]')).toBe(true)
    expect(() =>
      faqPublishBracketGuard({
        data: { _status: 'published', answer: 'Rate is [BESTÄTIGEN] €30' },
        originalDoc: {},
      } as never),
    ).toThrow(/draft marker/)
    expect(
      faqPublishBracketGuard({
        data: { _status: 'draft', answer: 'Rate is [CONFIRM] €30' },
        originalDoc: {},
      } as never),
    ).toBeTruthy()
  })

  it('empty-source token hides FAQ (unresolved) before JSON-LD', () => {
    const bad = resolveFaqTokens('Call {{phoneMain}}', 'en', ctx())
    expect(bad.unresolved.length).toBeGreaterThan(0)
    // Simulated drop: only resolved FAQs reach JSON-LD
    const rendered = [{ question: 'Wifi?', answer: 'Ask reception.' }]
    const graph = buildFAQPageGraph(rendered)
    expect(graph.mainEntity).toHaveLength(1)
    expect(JSON.stringify(graph)).not.toContain('phoneMain')
  })

  it('JSON-LD parity: rendered subset === emitted subset', () => {
    const rendered = [
      { question: `Pets cost ${resolveFaqTokens('{{petFee}}', 'en', ctx()).text}`, answer: 'Dogs welcome.' },
      { question: 'Breakfast?', answer: resolveFaqTokens('From {{breakfastWeekday}}', 'en', ctx()).text },
    ]
    const graph = buildFAQPageGraph(rendered)
    expect(graph.mainEntity.map((e) => e.name)).toEqual(rendered.map((r) => r.question))
    expect(graph.mainEntity.map((e) => e.acceptedAnswer.text)).toEqual(
      rendered.map((r) => r.answer),
    )
  })

  it('extractFaqTokens finds names', () => {
    expect(extractFaqTokens('A {{petFee}} and {{checkinTime}}')).toEqual([
      'petFee',
      'checkinTime',
    ])
  })
})
