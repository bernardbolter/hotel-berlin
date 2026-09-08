import type { OpeningHoursEntry } from '@/lib/venue-time'
import { breakfastHourSplit, toOpeningHoursEntries } from '@/lib/venues/formatHours'
import type { Hotel } from '@/payload-types'

import { getPayloadClient } from './client'

export type LocalizedStayFact = {
  value: string
  note: string
}

export type StayExtra = {
  key: 'wundermart' | 'bettAndBike' | 'saunaFitness' | 'pets'
  value: string
  note: string
}

export type BreakfastPricing = {
  adultPrice: number | null
  childPrice: number | null
  childAgeFrom: number | null
}

export type GuestStayInfo = {
  checkoutTime: string
  checkoutNote: string
  breakfastHours: string
  breakfastLocation: string
  breakfastWeekdays: string | null
  breakfastWeekend: string | null
  breakfastPricing: BreakfastPricing
  roomServiceOffered: boolean
  roomServiceNote: string
  wifiNetwork: string
  wifiPassword: string
  parkingSummary: string
  luggageNote: string
  checkout: LocalizedStayFact
  breakfast: LocalizedStayFact
  parking: LocalizedStayFact
  luggage: LocalizedStayFact
  extras: StayExtra[]
}

const FALLBACK_EN = {
  checkout: { value: '12:00', note: 'Later on request' },
  breakfast: { value: '06:30 – 10:00 · Sat/Sun until 11:00', note: 'Lütze, ground floor' },
  roomServiceNote: 'No room service — collect at the bar',
  parking: { value: '€4 / hour', note: 'Underground · max. €25/day' },
  luggage: { value: 'Reception', note: 'Also after check-out' },
  wifiNetwork: 'HBB_Guest',
  wifiPassword: 'welcome1958',
} as const

const FALLBACK_DE = {
  checkout: { value: '12:00', note: 'Später auf Anfrage' },
  breakfast: { value: '06:30 – 10:00 · Sa/So bis 11:00', note: 'Lütze, Erdgeschoss' },
  roomServiceNote: 'Kein Zimmerservice — Abholung an der Bar',
  parking: { value: '4 € / Std.', note: 'Tiefgarage · max. 25 €/Tag' },
  luggage: { value: 'Rezeption', note: 'Auch nach dem Check-out' },
} as const

const FALLBACK_BREAKFAST_PRICING: BreakfastPricing = {
  adultPrice: 23,
  childPrice: 12,
  childAgeFrom: 6,
}

type LocalePair = {
  valueDE?: string | null
  valueEN?: string | null
  noteDE?: string | null
  noteEN?: string | null
}

function pickLocale(
  group: LocalePair | null | undefined,
  locale: 'de' | 'en',
  fallback: LocalizedStayFact,
): LocalizedStayFact {
  const value =
    (locale === 'de' ? group?.valueDE : group?.valueEN)?.trim() ||
    (locale === 'de' ? group?.valueEN : group?.valueDE)?.trim() ||
    fallback.value
  const note =
    (locale === 'de' ? group?.noteDE : group?.noteEN)?.trim() ||
    (locale === 'de' ? group?.noteEN : group?.noteDE)?.trim() ||
    fallback.note
  return { value, note }
}

function extraFromPair(
  key: StayExtra['key'],
  group: LocalePair | null | undefined,
  locale: 'de' | 'en',
): StayExtra | null {
  const valuePreferred = locale === 'de' ? group?.valueDE : group?.valueEN
  const valueOther = locale === 'de' ? group?.valueEN : group?.valueDE
  const notePreferred = locale === 'de' ? group?.noteDE : group?.noteEN
  const noteOther = locale === 'de' ? group?.noteEN : group?.noteDE
  const value = valuePreferred?.trim() || valueOther?.trim() || ''
  const note = notePreferred?.trim() || noteOther?.trim() || ''
  if (!value && !note) return null
  return { key, value, note }
}

function lastClock(window: string): string {
  const parts = window.split(/\s*[–-]\s*/)
  return parts[parts.length - 1]?.trim() || window
}

export function hotelOpeningHoursEntries(
  hotel: Hotel | null | undefined,
): OpeningHoursEntry[] {
  const rows = hotel?.hours
  if (Array.isArray(rows) && rows.length > 0) return toOpeningHoursEntries(rows)
  const legacy = hotel?.openingHours
  if (Array.isArray(legacy)) return toOpeningHoursEntries(legacy)
  return []
}

export function formatBreakfastHoursSummary(
  split: { weekdays: string | null; weekend: string | null },
  locale: 'de' | 'en',
): string | null {
  if (split.weekdays && split.weekend) {
    const close = lastClock(split.weekend)
    return locale === 'de'
      ? `${split.weekdays} · Sa/So bis ${close}`
      : `${split.weekdays} · Sat/Sun until ${close}`
  }
  return split.weekdays || split.weekend
}

function joinFact(fact: LocalizedStayFact): string {
  return [fact.value, fact.note].filter(Boolean).join(' · ')
}

function emptyStay(locale: 'de' | 'en'): GuestStayInfo {
  const fallbackCore = locale === 'de' ? FALLBACK_DE : FALLBACK_EN
  return {
    checkoutTime: fallbackCore.checkout.value,
    checkoutNote: fallbackCore.checkout.note,
    breakfastHours: fallbackCore.breakfast.value,
    breakfastLocation: fallbackCore.breakfast.note,
    breakfastWeekdays: '06:30 – 10:00',
    breakfastWeekend: '06:30 – 11:00',
    breakfastPricing: FALLBACK_BREAKFAST_PRICING,
    roomServiceOffered: false,
    roomServiceNote: fallbackCore.roomServiceNote,
    wifiNetwork: FALLBACK_EN.wifiNetwork,
    wifiPassword: FALLBACK_EN.wifiPassword,
    parkingSummary: joinFact(fallbackCore.parking),
    luggageNote: joinFact(fallbackCore.luggage),
    checkout: fallbackCore.checkout,
    breakfast: fallbackCore.breakfast,
    parking: fallbackCore.parking,
    luggage: fallbackCore.luggage,
    extras: [],
  }
}

export function guestStayFromHotel(
  hotel: Hotel | null | undefined,
  locale: 'de' | 'en' = 'en',
): GuestStayInfo {
  const fallbackCore = locale === 'de' ? FALLBACK_DE : FALLBACK_EN
  if (!hotel) return emptyStay(locale)

  const stay = hotel.guestStay
  const hoursSplit = breakfastHourSplit(hotelOpeningHoursEntries(hotel))
  const hoursSummary = formatBreakfastHoursSummary(hoursSplit, locale)
  const checkout = pickLocale(stay?.checkout, locale, {
    value: hotel.checkoutTime?.trim() || fallbackCore.checkout.value,
    note: stay?.checkoutNote?.trim() || fallbackCore.checkout.note,
  })
  const breakfast = pickLocale(stay?.breakfast, locale, {
    value: hoursSummary || fallbackCore.breakfast.value,
    note: stay?.breakfastLocation?.trim() || fallbackCore.breakfast.note,
  })
  const parking = pickLocale(stay?.parking, locale, {
    value: stay?.parkingSummary?.trim() || fallbackCore.parking.value,
    note: fallbackCore.parking.note,
  })
  const luggage = pickLocale(stay?.luggage, locale, {
    value: stay?.luggageNote?.trim() || fallbackCore.luggage.value,
    note: fallbackCore.luggage.note,
  })

  const extras = (
    [
      extraFromPair('wundermart', stay?.more?.wundermart, locale),
      extraFromPair('bettAndBike', stay?.more?.bettAndBike, locale),
      extraFromPair('saunaFitness', stay?.more?.saunaFitness, locale),
      extraFromPair('pets', stay?.more?.pets, locale),
    ] as const
  ).filter((item): item is StayExtra => item != null)

  const pricing = hotel.breakfastPricing
  const roomNote = hotel.roomService?.note?.trim()

  return {
    checkoutTime: checkout.value,
    checkoutNote: checkout.note,
    breakfastHours: hoursSummary || breakfast.value,
    breakfastLocation: breakfast.note,
    breakfastWeekdays: hoursSplit.weekdays,
    breakfastWeekend: hoursSplit.weekend,
    breakfastPricing: {
      adultPrice: pricing?.adultPrice ?? FALLBACK_BREAKFAST_PRICING.adultPrice,
      childPrice: pricing?.childPrice ?? FALLBACK_BREAKFAST_PRICING.childPrice,
      childAgeFrom: pricing?.childAgeFrom ?? FALLBACK_BREAKFAST_PRICING.childAgeFrom,
    },
    roomServiceOffered: hotel.roomService?.offered === true,
    roomServiceNote: roomNote || fallbackCore.roomServiceNote,
    wifiNetwork: stay?.wifiNetwork?.trim() || FALLBACK_EN.wifiNetwork,
    wifiPassword: stay?.wifiPassword?.trim() || FALLBACK_EN.wifiPassword,
    parkingSummary: joinFact(parking),
    luggageNote: joinFact(luggage),
    checkout,
    breakfast: hoursSummary ? { value: hoursSummary, note: breakfast.note } : breakfast,
    parking,
    luggage,
    extras,
  }
}

export async function getHotel(locale?: 'de' | 'en'): Promise<Hotel | null> {
  const payload = await getPayloadClient()
  try {
    return (await payload.findGlobal({
      slug: 'hotel',
      depth: 0,
      ...(locale ? { locale } : {}),
    })) as Hotel
  } catch {
    return null
  }
}

export type RoomsPageIntro = {
  title: string | null
  body: string | null
  compareTableEnabled: boolean
}

export type RoomsSuitesCalloutContent = {
  enabled: boolean
  insertAfterSlug: string
  quote: string | null
  title: string | null
  body: string | null
}

export type RoomsPageContent = RoomsPageIntro & {
  suitesCallout: RoomsSuitesCalloutContent | null
}

export async function getRoomsPageIntro(locale: 'de' | 'en'): Promise<RoomsPageIntro> {
  const content = await getRoomsPageContent(locale)
  return {
    title: content.title,
    body: content.body,
    compareTableEnabled: content.compareTableEnabled,
  }
}

export async function getRoomsPageContent(locale: 'de' | 'en'): Promise<RoomsPageContent> {
  const hotel = await getHotel(locale).catch(() => null)
  const callout = hotel?.roomsSuitesCallout
  const quote = callout?.quote?.trim() || null
  const title = callout?.title?.trim() || null
  const body = callout?.body?.trim() || null
  const hasCalloutContent = Boolean(quote || title || body)

  return {
    title: hotel?.roomsPageIntro?.title?.trim() || null,
    body: hotel?.roomsPageIntro?.body?.trim() || null,
    compareTableEnabled: hotel?.compareTable?.enabled !== false,
    suitesCallout:
      callout?.enabled !== false && hasCalloutContent
        ? {
            enabled: true,
            insertAfterSlug: callout?.insertAfterSlug?.trim() || 'premium',
            quote,
            title,
            body,
          }
        : null,
  }
}

export async function getGuestStayInfo(locale: 'de' | 'en' = 'en'): Promise<GuestStayInfo> {
  const hotel = await getHotel(locale).catch(() => null)
  return guestStayFromHotel(hotel, locale)
}
