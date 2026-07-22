import type { HeroSlide as HeroSlideDoc, Homepage, Hotel, Media } from '@/payload-types'

import { heroSlides as fallbackHeroSlides, type HeroSlide } from '@/components/home/heroSlides'
import { getPayloadClient } from '@/lib/payload/client'

function mediaUrl(image: number | Media | null | undefined): string | null {
  return typeof image === 'object' && image && 'url' in image && image.url ? image.url : null
}

function venueCaption(venue: HeroSlideDoc['venue']): string | null {
  if (!venue || typeof venue !== 'object') return null
  const name = venue.name?.trim()
  if (!name) return null
  const floor = venue.location?.trim()
  const parts = [name.toUpperCase()]
  if (floor) parts.push(floor.toUpperCase())
  return parts.join(' · ')
}

function mapCollectionSlide(
  enDoc: HeroSlideDoc,
  deDoc: HeroSlideDoc | undefined,
): HeroSlide | null {
  const src = mediaUrl(enDoc.image)
  if (!src) return null

  const captionEN = enDoc.captionOverride?.trim() || venueCaption(enDoc.venue) || ''
  const captionDE =
    deDoc?.captionOverride?.trim() ||
    venueCaption(deDoc?.venue) ||
    venueCaption(enDoc.venue) ||
    captionEN

  return {
    src,
    alt: enDoc.altText ?? '',
    captionEN,
    captionDE,
    credit: enDoc.credit ?? undefined,
  }
}

/** Legacy homepage global array — kept as migration fallback. */
function mapHomepageSlides(enPage: Homepage, dePage: Homepage): HeroSlide[] {
  const enSlides = enPage.heroSlides ?? []
  const deSlides = dePage.heroSlides ?? []

  return enSlides
    .map((slide, index) => {
      const src = mediaUrl(slide.image)
      if (!src) return null

      const deSlide = deSlides[index]

      return {
        src,
        alt: slide.alt ?? '',
        captionEN: slide.caption ?? '',
        captionDE: deSlide?.caption ?? slide.caption ?? '',
      } satisfies HeroSlide
    })
    .filter((slide): slide is HeroSlide => slide !== null)
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const payload = await getPayloadClient()

    const [enResult, deResult] = await Promise.all([
      payload.find({
        collection: 'hero-slides',
        locale: 'en',
        depth: 2,
        limit: 50,
        sort: 'order',
        where: { enabled: { equals: true } },
      }),
      payload.find({
        collection: 'hero-slides',
        locale: 'de',
        depth: 2,
        limit: 50,
        sort: 'order',
        where: { enabled: { equals: true } },
      }),
    ])

    const deById = new Map<number, HeroSlideDoc>(
      deResult.docs.map((doc) => [doc.id, doc]),
    )
    const fromCollection = enResult.docs
      .map((enDoc) => mapCollectionSlide(enDoc, deById.get(enDoc.id)))
      .filter((slide): slide is HeroSlide => slide !== null)

    if (fromCollection.length > 0) return fromCollection

    const [enPage, dePage] = await Promise.all([
      payload.findGlobal({ slug: 'homepage', locale: 'en', depth: 2 }),
      payload.findGlobal({ slug: 'homepage', locale: 'de', depth: 2 }),
    ])

    const fromHomepage = mapHomepageSlides(enPage, dePage)
    if (fromHomepage.length > 0) return fromHomepage
  } catch {
    // Fall through to placeholders when CMS is unavailable.
  }

  return fallbackHeroSlides
}

export type HeroMapCopy = {
  directionsLabel: string
  shortAddress: string
}

export async function getHeroMapCopy(locale: 'de' | 'en'): Promise<HeroMapCopy> {
  const defaults: Record<'de' | 'en', HeroMapCopy> = {
    en: {
      directionsLabel: 'Get Directions',
      shortAddress: 'Lützowplatz 17, Tiergarten',
    },
    de: {
      directionsLabel: 'Wegbeschreibung',
      shortAddress: 'Lützowplatz 17, Tiergarten',
    },
  }

  try {
    const payload = await getPayloadClient()
    const hotel = (await payload.findGlobal({
      slug: 'hotel',
      locale,
      depth: 0,
    })) as Hotel

    return {
      directionsLabel: hotel.getDirectionsLabel?.trim() || defaults[locale].directionsLabel,
      shortAddress: hotel.heroShortAddress?.trim() || defaults[locale].shortAddress,
    }
  } catch {
    return defaults[locale]
  }
}

export type RoomsTeaserCopy = {
  heading: string
  body: string
  ctaLabel: string
}

export async function getRoomsTeaserCopy(locale: 'de' | 'en'): Promise<RoomsTeaserCopy> {
  const defaults: Record<'de' | 'en', RoomsTeaserCopy> = {
    en: {
      heading: 'Sleep & Relax',
      body: 'Whether it’s your first time in Berlin or you’re a seasoned traveller, flying solo or arriving with the family our spacious, quiet rooms and suites are your place to land. Thoughtful design details and a relaxed, home-like feel make every room a personal retreat. This is where your Berlin story begins.',
      ctaLabel: 'Discover our rooms',
    },
    de: {
      heading: 'Sleep & Relax',
      body: 'Ob du zum ersten Mal in Berlin bist oder die Stadt schon kennst, allein unterwegs oder mit der Familie — unsere großzügigen, ruhigen Zimmer und Suiten sind dein Ort zum Ankommen. Durchdachte Details und ein entspanntes, heimisches Gefühl machen jedes Zimmer zu einem persönlichen Rückzugsort. Hier beginnt deine Berlin-Geschichte.',
      ctaLabel: 'Zimmer entdecken',
    },
  }

  try {
    const payload = await getPayloadClient()
    const page = (await payload.findGlobal({
      slug: 'homepage',
      locale,
      depth: 0,
    })) as Homepage

    const teaser = page.roomsTeaser

    return {
      heading: teaser?.heading?.trim() || defaults[locale].heading,
      body: teaser?.body?.trim() || defaults[locale].body,
      ctaLabel: teaser?.ctaLabel?.trim() || defaults[locale].ctaLabel,
    }
  } catch {
    return defaults[locale]
  }
}
