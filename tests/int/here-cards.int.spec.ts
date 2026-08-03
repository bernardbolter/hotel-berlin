import { describe, expect, it } from 'vitest'

import {
  activeSegmentClosesAt,
  pickKitchenOrPrimarySegment,
} from '../../src/lib/here/tonight'
import { berlinLocalToUtc } from '../../src/lib/venue-time/berlin'
import { guestStayFromHotel } from '../../src/lib/payload/hotel'
import type { Hotel, Venue } from '../../src/payload-types'

function atBerlin(isoLocal: string): Date {
  const [date, time = '00:00:00'] = isoLocal.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm, ss = '0'] = time.split(':')
  return berlinLocalToUtc(y, m, d, Number(hh), Number(mm), Number(ss))
}

const lutzeHours = [
  { dayOfWeek: 'Mo-Su', opens: '10:00', closes: 'open end', segment: 'Bar' },
  { dayOfWeek: 'Mo-Su', opens: '11:30', closes: '15:00', segment: 'Kitchen' },
  { dayOfWeek: 'Mo-Su', opens: '17:00', closes: '22:30', segment: 'Kitchen' },
] as Venue['openingHours']

describe('pickKitchenOrPrimarySegment', () => {
  it('prefers Kitchen over Bar for VenueCard (Tonight Lütze)', () => {
    const segment = pickKitchenOrPrimarySegment(lutzeHours, atBerlin('2026-08-06T16:00:00'))
    expect(segment).toEqual({
      label: 'Kitchen',
      status: 'Closed',
      note: 'Reopens 17:00',
    })
  })

  it('reports Kitchen open during dinner service', () => {
    const segment = pickKitchenOrPrimarySegment(lutzeHours, atBerlin('2026-08-06T19:00:00'))
    expect(segment?.status).toBe('Open')
    expect(activeSegmentClosesAt(lutzeHours, 'Kitchen', atBerlin('2026-08-06T19:00:00'))).toBe(
      '22:30',
    )
  })
})

describe('guestStayFromHotel', () => {
  it('falls back when hotel global is empty', () => {
    const stay = guestStayFromHotel(null)
    expect(stay.wifiNetwork).toBe('HBB_Guest')
    expect(stay.checkoutTime).toBe('12:00')
  })

  it('reads guestStay + breakfast hours from hotel', () => {
    const stay = guestStayFromHotel({
      id: 1,
      name: 'Hotel Berlin, Berlin',
      checkoutTime: '12:00',
      openingHours: { breakfast: 'Mo-Su 06:30-10:00' },
      guestStay: {
        checkoutNote: 'noon',
        breakfastLocation: 'Lütze ground floor',
        wifiNetwork: 'HBB_Guest',
        wifiPassword: 'secret',
        parkingSummary: 'Underground',
        luggageNote: 'Ask reception',
      },
      updatedAt: '',
      createdAt: '',
    } as Hotel)

    expect(stay.breakfastHours).toBe('06:30 – 10:00')
    expect(stay.wifiPassword).toBe('secret')
    expect(stay.breakfastLocation).toBe('Lütze ground floor')
  })
})
