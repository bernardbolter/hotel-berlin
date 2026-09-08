import { firstHereImage, HERE_IMAGES, type HereImage } from '@/lib/here/images'
import { getEatAndDrink } from '@/lib/payload/homepage'
import { guestStayFromHotel, getHotel } from '@/lib/payload/hotel'
import { getVenueBySlug } from '@/lib/payload/venues'
import { mediaAlt, mediaUrl } from '@/lib/spotlight/media'
import { localizeCuisineLead, localizeInBuildingLocation } from '@/lib/venues/localizeCopy'
import { toOpeningHoursEntries } from '@/lib/venues/formatHours'
import { isOpenEndedEntry } from '@/lib/venue-time/deriveOpenClosed'
import type { OpeningHoursEntry } from '@/lib/venue-time'
import type { Venue } from '@/payload-types'

export type DiningServiceKind = 'breakfast' | 'wundermart' | 'garden'

export type DiningServiceCard = {
  kind: DiningServiceKind
  href: string
  title: string
  value: string
  sub: string | null
}

export type DiningBandFact = {
  icon: 'bar' | 'cuisine' | 'location'
  label: string
  value: string
}

export type DiningBandData = {
  heading: string
  image: HereImage
  hours: OpeningHoursEntry[]
  facts: DiningBandFact[]
  roomServiceNote: string
  cards: DiningServiceCard[]
}

function gardenConfirmed(venue: Venue | null): boolean {
  if (!venue?.isGuestFacing) return false
  return Boolean(venue.shortDescription?.trim() || venue.images?.length || venue.heroImage)
}

function lastClock(window: string): string {
  const parts = window.split(/\s*[–-]\s*/)
  return parts[parts.length - 1]?.trim() || window
}

function barFact(
  hours: OpeningHoursEntry[],
  loc: 'de' | 'en',
  openEndLabel: string,
): DiningBandFact | null {
  const bar = hours.filter((entry) => (entry.segment ?? entry.label ?? '').toLowerCase() === 'bar')
  const last = bar[bar.length - 1]
  if (!last?.opens?.trim()) return null

  const label = 'Bar'
  if (last.closes?.trim()) {
    return {
      icon: 'bar',
      label,
      value: loc === 'de' ? `Bar bis ${last.closes.trim()}` : `Bar until ${last.closes.trim()}`,
    }
  }
  if (isOpenEndedEntry(last)) {
    return { icon: 'bar', label, value: `${label} · ${openEndLabel}` }
  }
  return { icon: 'bar', label, value: last.opens.trim() }
}

export async function getDiningBandData(
  locale: string,
  openEndLabel = 'open end',
): Promise<DiningBandData | null> {
  const loc = locale === 'de' ? 'de' : 'en'
  const [lutze, wundermart, garden, hotel, eatAndDrink] = await Promise.all([
    getVenueBySlug('lutze', loc).catch(() => null),
    getVenueBySlug('wundermart', loc).catch(() => null),
    getVenueBySlug('lutze-garten', loc).catch(() => null),
    getHotel(loc).catch(() => null),
    getEatAndDrink(loc),
  ])

  if (!lutze) return null

  const stay = guestStayFromHotel(hotel, loc)
  const hours = toOpeningHoursEntries(lutze.openingHours)
  const cuisine = localizeCuisineLead(lutze.servesCuisine, loc)
  const cuisineLine = [cuisine, lutze.priceRange].filter(Boolean).join(' · ') || null
  const location =
    localizeInBuildingLocation(lutze.spotlightLocation, loc) ||
    localizeInBuildingLocation(lutze.location, loc) ||
    null

  const heroSrc = mediaUrl(lutze.heroImage)
  const gallerySrc = lutze.images?.[0] ? mediaUrl(lutze.images[0].image) : null

  const facts: DiningBandFact[] = []
  const bar = barFact(hours, loc, openEndLabel)
  if (bar) facts.push(bar)
  if (cuisineLine) {
    facts.push({
      icon: 'cuisine',
      label: loc === 'de' ? 'Küche' : 'Cuisine',
      value: cuisineLine,
    })
  }
  if (location) {
    facts.push({
      icon: 'location',
      label: loc === 'de' ? 'Ort' : 'Location',
      value: location,
    })
  }

  const cards: DiningServiceCard[] = []

  const price = stay.breakfastPricing
  const priceLine =
    price.adultPrice != null && price.childPrice != null && price.childAgeFrom != null
      ? loc === 'de'
        ? `${price.adultPrice} € · ${price.childPrice} € ab ${price.childAgeFrom} Jahren`
        : `€${price.adultPrice} · €${price.childPrice} from age ${price.childAgeFrom}`
      : null
  const weekendClose = stay.breakfastWeekend ? lastClock(stay.breakfastWeekend) : null
  const weekendBit = weekendClose
    ? loc === 'de'
      ? `Sa/So bis ${weekendClose}`
      : `Sat/Sun until ${weekendClose}`
    : null
  const breakfastHours = stay.breakfastWeekdays
    ? [stay.breakfastWeekdays, weekendBit].filter(Boolean).join(' · ')
    : stay.breakfastHours

  cards.push({
    kind: 'breakfast',
    href: '/here/dining#breakfast',
    title: loc === 'de' ? 'Frühstück' : 'Breakfast',
    value: breakfastHours,
    sub: [stay.breakfastLocation, priceLine].filter(Boolean).join(' · ') || null,
  })

  if (wundermart) {
    cards.push({
      kind: 'wundermart',
      href: '/here/dining#wundermart',
      title: wundermart.name,
      value: ['24/7', wundermart.location?.trim()].filter(Boolean).join(' · '),
      sub: wundermart.shortDescription?.trim() || null,
    })
  }

  if (gardenConfirmed(garden)) {
    cards.push({
      kind: 'garden',
      href: '/here/dining#garden',
      title: garden!.name,
      value: garden!.location?.trim() || (loc === 'de' ? 'Saison' : 'Seasonal'),
      sub: garden!.shortDescription?.trim() || null,
    })
  }

  return {
    heading: lutze.name,
    image: firstHereImage(
      heroSrc ? { src: heroSrc, alt: mediaAlt(lutze.heroImage, lutze.name) } : null,
      gallerySrc && lutze.images?.[0]
        ? { src: gallerySrc, alt: lutze.images[0].alt || lutze.name }
        : null,
      eatAndDrink.image,
      HERE_IMAGES.lutzeInterior,
    ),
    hours,
    facts,
    roomServiceNote: stay.roomServiceOffered ? '' : stay.roomServiceNote,
    cards,
  }
}
