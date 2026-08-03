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

export async function getHotel(): Promise<Hotel | null> {
  const payload = await getPayloadClient()
  try {
    return (await payload.findGlobal({ slug: 'hotel', depth: 0 })) as Hotel
  } catch {
    return null
  }
}

export async function getGuestStayInfo(): Promise<GuestStayInfo> {
  const hotel = await getHotel().catch(() => null)
  return guestStayFromHotel(hotel)
}
