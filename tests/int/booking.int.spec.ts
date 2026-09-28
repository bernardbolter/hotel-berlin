import { describe, expect, it } from 'vitest'

import {
  addDaysIso,
  berlinTodayIso,
  buildMeetingPackageUrl,
  buildRadissonBookingUrl,
  buildRadissonBookingUrlTemplate,
  buildReserveAction,
  footerBookingHref,
  isoToVendorDate,
  MEETINGPACKAGE_VENUE_URL,
} from '../../src/lib/booking'

describe('isoToVendorDate', () => {
  it('converts ISO dates to MM/DD/YYYY for the Radisson engine', () => {
    expect(isoToVendorDate('2026-09-16')).toBe('09/16/2026')
    expect(isoToVendorDate('2026-01-05')).toBe('01/05/2026')
    expect(isoToVendorDate('2027-12-31')).toBe('12/31/2027')
  })

  it('rejects invalid calendar dates', () => {
    expect(() => isoToVendorDate('2026-13-01')).toThrow(/Invalid ISO date/)
    expect(() => isoToVendorDate('16.09.2026')).toThrow(/Invalid ISO date/)
  })
})

describe('buildRadissonBookingUrl', () => {
  it('builds a de-de handoff with unencoded vendor dates and languageid 7', () => {
    const url = buildRadissonBookingUrl({
      checkin: '2026-09-16',
      checkout: '2026-09-17',
      adults: 3,
      children: 2,
      rooms: 2,
      locale: 'de',
    })

    expect(url).toBe(
      'https://www.radissonhotels.com/de-de/hotels/radisson-individuals-berlin?datein=09/16/2026&dateout=09/17/2026&rooms=2&adults=3&children=2&languageid=7',
    )
  })

  it('uses en-gb for English and omits children when zero', () => {
    const url = buildRadissonBookingUrl({
      checkin: '2026-09-16',
      checkout: '2026-09-18',
      adults: 2,
      children: 0,
      rooms: 1,
      locale: 'en',
    })

    expect(url).toContain('/en-gb/hotels/radisson-individuals-berlin')
    expect(url).toContain('languageid=1')
    expect(url).not.toContain('children=')
  })

  it('forwards the GA linker when present', () => {
    const url = buildRadissonBookingUrl({
      checkin: '2026-09-16',
      checkout: '2026-09-17',
      adults: 1,
      rooms: 1,
      locale: 'de',
      ga: 'GA1.1.123.456',
    })
    expect(url).toContain('_ga=GA1.1.123.456')
  })
})

describe('footerBookingHref', () => {
  it('maps /book to a locale-aware Radisson URL so the footer works without JS', () => {
    expect(footerBookingHref('/book', 'de', '2026-09-21')).toBe(
      buildRadissonBookingUrl({
        checkin: '2026-09-21',
        checkout: '2026-09-22',
        adults: 1,
        rooms: 1,
        locale: 'de',
      }),
    )
    expect(footerBookingHref('/book', 'en', '2026-09-21')).toContain(
      '/en-gb/hotels/radisson-individuals-berlin',
    )
  })

  it('leaves a custom CMS URL unchanged', () => {
    expect(footerBookingHref('https://example.com/stay', 'de', '2026-09-21')).toBe(
      'https://example.com/stay',
    )
  })
})

describe('buildRadissonBookingUrlTemplate / ReserveAction', () => {
  it('emits the same query keys the human form fills', () => {
    const template = buildRadissonBookingUrlTemplate('de')
    expect(template).toBe(
      'https://www.radissonhotels.com/de-de/hotels/radisson-individuals-berlin?datein={checkin}&dateout={checkout}&adults={adults}&rooms={rooms}&languageid=7',
    )

    const action = buildReserveAction('de')
    const target = action.target as { urlTemplate: string; inLanguage: string }
    expect(action['@type']).toBe('ReserveAction')
    expect(target.urlTemplate).toBe(template)
    expect(target.inLanguage).toBe('de')
  })

  it('switches English template to en-gb', () => {
    const action = buildReserveAction('en')
    const target = action.target as { urlTemplate: string; inLanguage: string }
    expect(target.urlTemplate).toContain('/en-gb/')
    expect(target.inLanguage).toBe('en')
  })
})

describe('buildMeetingPackageUrl', () => {
  it('carries date, time, length and delegates instead of dropping them', () => {
    const url = new URL(
      buildMeetingPackageUrl({
        date: '2026-09-20',
        time: '09:00',
        meetingLength: '8',
        delegates: 10,
        locale: 'de',
      }),
    )

    expect(url.origin + url.pathname).toBe(MEETINGPACKAGE_VENUE_URL)
    expect(url.searchParams.get('delegates')).toBe('10')
    expect(url.searchParams.get('meeting-length')).toBe('8')
    expect(url.searchParams.get('date')).toBe('2026-09-20')
    expect(url.searchParams.get('time')).toBe('09:00')
    expect(url.searchParams.get('start_date')).toBe('2026-09-20')
    expect(url.searchParams.get('start_time')).toBe('09:00')
    expect(url.searchParams.get('duration')).toBe('8')
    expect(url.searchParams.get('lang')).toBe('de')
    expect(url.searchParams.get('tab')).toBe('room')
  })

  it('requires a real date', () => {
    expect(() =>
      buildMeetingPackageUrl({
        date: '',
        time: '09:00',
        meetingLength: '8',
        delegates: 10,
        locale: 'en',
      }),
    ).toThrow(/Invalid ISO date/)
  })
})

describe('date helpers', () => {
  it('adds calendar days across month boundaries', () => {
    expect(addDaysIso('2026-09-30', 1)).toBe('2026-10-01')
    expect(addDaysIso('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('returns a Berlin calendar date for now', () => {
    expect(berlinTodayIso(new Date('2026-09-16T22:00:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
