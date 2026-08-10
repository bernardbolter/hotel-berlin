import type { Hotel } from '@/payload-types'

import { getPayloadClient } from './client'

export type GuestStayInfo = {
  checkoutTime: string
  checkoutNote: string
  breakfastHours: string
  breakfastLocation: string
  wifiNetwork: string
  wifiPassword: string
  parkingSummary: string
  luggageNote: string
}

const FALLBACK: GuestStayInfo = {
  checkoutTime: '12:00',
  checkoutNote: 'noon',
  breakfastHours: '06:30 – 10:00',
  breakfastLocation: 'Lütze ground floor',
  wifiNetwork: 'HBB_Guest',
  wifiPassword: 'welcome1958',
  parkingSummary: 'Underground · 200+ spaces · €4/hr · max €25/day',
  luggageNote: 'Available after check-out · ask at reception',
}

function formatBreakfastHours(raw: string | null | undefined): string {
  if (!raw) return FALLBACK.breakfastHours
  // "Mo-Su 06:30-10:00" → "06:30 – 10:00"
  const match = /(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/.exec(raw)
  if (!match) return raw
  return `${match[1]} – ${match[2]}`
}

export function guestStayFromHotel(hotel: Hotel | null | undefined): GuestStayInfo {
  if (!hotel) return FALLBACK
  const stay = hotel.guestStay

  return {
    checkoutTime: hotel.checkoutTime?.trim() || FALLBACK.checkoutTime,
    checkoutNote: stay?.checkoutNote?.trim() || FALLBACK.checkoutNote,
    breakfastHours: formatBreakfastHours(hotel.openingHours?.breakfast),
    breakfastLocation: stay?.breakfastLocation?.trim() || FALLBACK.breakfastLocation,
    wifiNetwork: stay?.wifiNetwork?.trim() || FALLBACK.wifiNetwork,
    wifiPassword: stay?.wifiPassword?.trim() || FALLBACK.wifiPassword,
    parkingSummary: stay?.parkingSummary?.trim() || FALLBACK.parkingSummary,
    luggageNote: stay?.luggageNote?.trim() || FALLBACK.luggageNote,
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

export async function getGuestStayInfo(): Promise<GuestStayInfo> {
  const hotel = await getHotel().catch(() => null)
  return guestStayFromHotel(hotel)
}
