import { describe, expect, it } from 'vitest'

import { HUB_FAQ_SLUGS } from '../../src/lib/faqs'
import { GUEST_AZ_FAQS } from '../../src/seed/guest-az-faqs'

describe('guest A–Z FAQs', () => {
  const slugs = GUEST_AZ_FAQS.map((faq) => faq.slug)
  const texts = GUEST_AZ_FAQS.flatMap((faq) => [
    faq.en.question,
    faq.en.answer,
    faq.de.question,
    faq.de.answer,
  ])

  it('covers the hub accordion slugs in both locales', () => {
    for (const slug of HUB_FAQ_SLUGS) {
      const row = GUEST_AZ_FAQS.find((faq) => faq.slug === slug)
      expect(row, slug).toBeTruthy()
      expect(row?.de.question).not.toBe(row?.en.question)
    }
  })

  it('keeps gym, sauna, EV charging, and card-only on the reference page', () => {
    expect(slugs).toEqual(expect.arrayContaining([
      'guest-gym',
      'guest-sauna',
      'guest-ev-charging',
      'guest-business-center',
      'guest-card-only',
      'guest-dining-card-only',
      'guest-checkin',
    ]))
  })

  it('includes the 1.80 m parking height limit', () => {
    const parking = GUEST_AZ_FAQS.find((faq) => faq.slug === 'guest-parking')
    expect(parking?.en.answer).toMatch(/1\.80 m/)
    expect(parking?.de.answer).toMatch(/1,80 m/)
  })

  it('does not seed WiFi credentials as fact', () => {
    expect(texts.join('\n')).not.toMatch(/HBB[_-]|GUESTCONNECT|welcome1958/i)
  })

  it('does not seed sauna clock times', () => {
    const sauna = GUEST_AZ_FAQS.find((faq) => faq.slug === 'guest-sauna')
    expect(`${sauna?.en.answer} ${sauna?.de.answer}`).not.toMatch(/\d{1,2}:\d{2}/)
    expect(sauna?.de.answer).toMatch(/auf Anfrage/)
  })

  it('does not mention an airport shuttle', () => {
    expect(texts.join('\n')).not.toMatch(/shuttle|Flughafenshuttle/i)
  })
})
