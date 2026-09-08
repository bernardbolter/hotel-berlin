import { describe, expect, it } from 'vitest'

import {
  activeSegmentClosesAt,
  pickKitchenOrPrimarySegment,
} from '../../src/lib/here/tonight'
import { berlinTimeOfDay, getTimeOfDay } from '../../src/lib/here/greeting'
import { personGivenName, personShortName } from '../../src/lib/people/initials'
import { splitBridgeLabel } from '../../src/lib/nav/bridge'
import {
  formatLiveEventSubline,
  getHeroSubline,
  venueSubline,
} from '../../src/lib/here/getHeroSubline'
import { heroSlideContextWhere } from '../../src/lib/payload/homepage'
import { berlinLocalToUtc } from '../../src/lib/venue-time/berlin'
import { guestStayFromHotel } from '../../src/lib/payload/hotel'
import { formatVenueHoursSegments } from '../../src/lib/venues/formatHours'
import { localizeInBuildingLocation } from '../../src/lib/venues/localizeCopy'
import type { Hotel, Venue } from '../../src/payload-types'

function atBerlin(isoLocal: string): Date {
  const [date, time = '00:00:00'] = isoLocal.split('T')
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm, ss = '0'] = time.split(':')
  return berlinLocalToUtc(y, m, d, Number(hh), Number(mm), Number(ss))
}

const lutzeHours = [
  { dayOfWeek: 'Mo-Su', opens: '10:00', closes: '01:00', segment: 'Bar' },
  { dayOfWeek: 'Mo-Su', opens: '11:30', closes: '15:00', segment: 'Kitchen' },
  { dayOfWeek: 'Mo-Su', opens: '17:00', closes: '22:30', segment: 'Kitchen' },
] as Venue['openingHours']

describe('pickKitchenOrPrimarySegment', () => {
  it('prefers Kitchen over Bar for VenueCard (Tonight Lütze)', () => {
    const segment = pickKitchenOrPrimarySegment(lutzeHours, atBerlin('2026-08-06T16:00:00'))
    expect(segment).toEqual({
      label: 'Kitchen',
      status: 'Closed',
      nextOpensAt: '17:00',
      nextOpensTomorrow: false,
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
    expect(stay.checkout.note).toBe('Later on request')
    expect(stay.breakfastHours).toBe('06:30 – 10:00 · Sat/Sun until 11:00')
    expect(stay.roomServiceNote).toBe('No room service — collect at the bar')
    expect(stay.breakfastPricing).toEqual({ adultPrice: 23, childPrice: 12, childAgeFrom: 6 })
  })

  it('reads German value/note pairs by locale', () => {
    const stay = guestStayFromHotel(
      {
        id: 1,
        name: 'Hotel Berlin, Berlin',
        guestStay: {
          wifiNetwork: 'HBB_Guest',
          wifiPassword: 'secret',
          checkout: {
            valueDE: '12:00',
            valueEN: '12:00',
            noteDE: 'Später auf Anfrage',
            noteEN: 'Later on request',
          },
          breakfast: {
            valueDE: '06:30 – 10:00',
            valueEN: '06:30 – 10:00',
            noteDE: 'Lütze, Erdgeschoss',
            noteEN: 'Lütze, ground floor',
          },
          parking: {
            valueDE: '4 € / Std.',
            valueEN: '€4 / hour',
            noteDE: 'Tiefgarage · max. 25 €/Tag',
            noteEN: 'Underground · max. €25/day',
          },
          luggage: {
            valueDE: 'Rezeption',
            valueEN: 'Reception',
            noteDE: 'Auch nach dem Check-out',
            noteEN: 'Also after check-out',
          },
          more: {
            pets: {
              valueDE: '€30 / Tag',
              valueEN: '€30 / day',
              noteDE: 'Hunde willkommen',
              noteEN: 'Dogs welcome',
            },
          },
        },
        updatedAt: '',
        createdAt: '',
      } as Hotel,
      'de',
    )

    expect(stay.checkout.note).toBe('Später auf Anfrage')
    expect(stay.breakfast.note).toBe('Lütze, Erdgeschoss')
    expect(stay.parking.value).toBe('4 € / Std.')
    expect(stay.luggage.note).toBe('Auch nach dem Check-out')
    expect(stay.wifiPassword).toBe('secret')
    expect(stay.extras).toEqual([
      { key: 'pets', value: '€30 / Tag', note: 'Hunde willkommen' },
    ])
  })

  it('reads breakfast hours from the hours array including weekend split', () => {
    const stay = guestStayFromHotel({
      id: 1,
      name: 'Hotel Berlin, Berlin',
      checkoutTime: '12:00',
      hours: [
        { dayOfWeek: 'Mo-Fr', opens: '06:30', closes: '10:00', segment: 'Breakfast' },
        { dayOfWeek: 'Sa-Su', opens: '06:30', closes: '11:00', segment: 'Breakfast' },
      ],
      breakfastPricing: { adultPrice: 23, childPrice: 12, childAgeFrom: 6 },
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

    expect(stay.breakfastHours).toBe('06:30 – 10:00 · Sat/Sun until 11:00')
    expect(stay.breakfastWeekdays).toBe('06:30 – 10:00')
    expect(stay.breakfastWeekend).toBe('06:30 – 11:00')
    expect(stay.breakfastPricing.adultPrice).toBe(23)
    expect(stay.wifiPassword).toBe('secret')
    expect(stay.breakfastLocation).toBe('Lütze ground floor')
  })
})

describe('getTimeOfDay', () => {
  it('maps Berlin hours to greeting slots', () => {
    expect(getTimeOfDay(6)).toBe('morning')
    expect(getTimeOfDay(11)).toBe('morning')
    expect(getTimeOfDay(12)).toBe('afternoon')
    expect(getTimeOfDay(17)).toBe('afternoon')
    expect(getTimeOfDay(18)).toBe('evening')
    expect(getTimeOfDay(23)).toBe('evening')
    expect(getTimeOfDay(2)).toBe('evening')
  })

  it('reads Berlin wall-clock from a UTC instant', () => {
    // 2026-08-20 08:00 Berlin (CEST = UTC+2)
    expect(berlinTimeOfDay(berlinLocalToUtc(2026, 8, 20, 8, 0, 0))).toBe('morning')
    expect(berlinTimeOfDay(berlinLocalToUtc(2026, 8, 20, 19, 0, 0))).toBe('evening')
  })
})

describe('formatVenueHoursSegments', () => {
  it('collapses Kitchen lunch + dinner and keeps Bar clock close', () => {
    const segments = formatVenueHoursSegments(lutzeHours)
    expect(segments).toEqual([
      { label: 'Bar', body: '10:00–01:00' },
      { label: 'Kitchen', body: '11:30–15:00 · 17:00–22:30' },
    ])
  })

  it('renders the i18n open-end phrase when isOpenEnded is set', () => {
    const segments = formatVenueHoursSegments(
      [{ dayOfWeek: 'Thursday', opens: '19:00', closes: '02:00', isOpenEnded: true, segment: 'KTTK' }],
      'open end',
    )
    expect(segments).toEqual([{ label: 'KTTK', body: '19:00 – open end' }])
  })
})

describe('localizeInBuildingLocation', () => {
  it('maps Ground Floor on German pages', () => {
    expect(localizeInBuildingLocation('Ground Floor, Lützowplatz 17', 'de')).toBe(
      'Erdgeschoss, Lützowplatz 17',
    )
    expect(localizeInBuildingLocation('Ground floor', 'de')).toBe('Erdgeschoss')
    expect(localizeInBuildingLocation('Ground floor', 'en')).toBe('Ground floor')
  })
})

describe('personGivenName', () => {
  it('uses the first token of a display name', () => {
    expect(personGivenName('Kristiane Kegelmann')).toBe('Kristiane')
    expect(personGivenName('Maike')).toBe('Maike')
  })
})

describe('personShortName', () => {
  it('uses given name plus last initial', () => {
    expect(personShortName('Jan Haverkamp')).toBe('Jan H.')
    expect(personShortName('Maike')).toBe('Maike')
  })
})

describe('splitBridgeLabel', () => {
  it('splits prompt and boxed action from CMS copy', () => {
    expect(splitBridgeLabel('Schon im Haus? ENTER →', '')).toEqual({
      prompt: 'Schon im Haus?',
      action: 'ENTER',
    })
    expect(splitBridgeLabel('Not here yet? STAY →', '')).toEqual({
      prompt: 'Not here yet?',
      action: 'STAY',
    })
    expect(splitBridgeLabel('Noch nicht hier? BLEIB →', '')).toEqual({
      prompt: 'Noch nicht hier?',
      action: 'BLEIB',
    })
  })
})

describe('getHeroSubline', () => {
  it('formats a live event as two lines', () => {
    expect(
      formatLiveEventSubline(
        {
          id: 1,
          name: 'Ping Pong Tournament',
          startDate: '2026-09-02T16:00:00.000Z',
          relativeTime: { kind: 'scheduled', time: '18:00' },
          occurrenceStart: new Date('2026-09-02T16:00:00.000Z'),
          venue: { id: 1, name: 'KTTK', spotlightLocation: 'Ground floor' },
        },
        'starts tonight at 18:00',
      ),
    ).toEqual({
      type: 'live-event',
      line1: 'Ping Pong Tournament starts tonight at 18:00',
      line2: 'KTTK · Ground floor',
    })
  })

  it('joins venue name and location', () => {
    expect(venueSubline({ name: 'KTTK — ping pong', spotlightLocation: 'B2' })).toBe(
      'KTTK · B2',
    )
  })

  it('falls back to the manual day-slot subline when live is skipped', async () => {
    await expect(
      getHeroSubline({
        locale: 'en',
        skipLive: true,
        translateRelative: () => '',
        manual: { line1: 'Tournament night starts at 19:00' },
      }),
    ).resolves.toEqual({
      type: 'manual',
      line1: 'Tournament night starts at 19:00',
      line2: null,
    })
  })

  it('returns none when live is skipped and no manual copy exists', async () => {
    await expect(
      getHeroSubline({
        locale: 'en',
        skipLive: true,
        translateRelative: () => '',
      }),
    ).resolves.toEqual({ type: 'none' })
  })
})

describe('heroSlideContextWhere', () => {
  it('requires an explicit here tag and treats missing context as homepage', () => {
    expect(heroSlideContextWhere('here')).toEqual({ context: { equals: 'here' } })
    expect(heroSlideContextWhere('homepage')).toEqual({
      or: [{ context: { equals: 'homepage' } }, { context: { exists: false } }],
    })
  })
})
