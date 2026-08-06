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
  /** CMS hero map image URL, or null to use the public fallback */
  imageUrl: string | null
}

const HERO_MAP_FALLBACK = '/images/hero_map.png'

export async function getHeroMapCopy(locale: 'de' | 'en'): Promise<HeroMapCopy> {
  const defaults: Record<'de' | 'en', Omit<HeroMapCopy, 'imageUrl'>> = {
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
      depth: 1,
    })) as Hotel

    return {
      directionsLabel: hotel.getDirectionsLabel?.trim() || defaults[locale].directionsLabel,
      shortAddress: hotel.heroShortAddress?.trim() || defaults[locale].shortAddress,
      imageUrl: mediaUrl(hotel.heroMapImage) ?? HERO_MAP_FALLBACK,
    }
  } catch {
    return {
      ...defaults[locale],
      imageUrl: HERO_MAP_FALLBACK,
    }
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

export type MeetAndWorkSlide = {
  id: string
  src: string
  alt: string
  caption: string
}

export type MeetAndWorkCopy = {
  kicker: string
  subhead: string
  body: string
  ctaLabel: string
  slides: MeetAndWorkSlide[]
}

const MEET_AND_WORK_PHOTO_FALLBACK = '/images/meet-and-work.jpg'

const meetAndWorkDefaults: Record<
  'de' | 'en',
  Omit<MeetAndWorkCopy, 'slides'> & { slideFallback: Omit<MeetAndWorkSlide, 'id' | 'src'> }
> = {
  en: {
    kicker: 'Meet & Work',
    subhead: 'Serious business, playful spaces',
    body: 'Business is in our DNA. With over 4,000 m² of flexible conference and meeting spaces, cutting-edge event technology, and a dedicated team, we ensure everything from conferences to workshops runs smoothly — leaving space for ideas and connections to take the lead.',
    ctaLabel: 'All meeting rooms',
    slideFallback: {
      alt: 'Hotel Berlin, Berlin meeting room with natural light and conference setup',
      caption: 'Berlin 3',
    },
  },
  de: {
    kicker: 'Tagen & Arbeiten',
    subhead: 'Ernsthaftes Business, verspielte Räume',
    body: 'Business liegt in unserer DNA. Mit über 4.000 m² flexibler Konferenz- und Meetingflächen, modernster Eventtechnik und einem engagierten Team sorgen wir dafür, dass alles von Konferenzen bis Workshops reibungslos läuft — mit Raum für Ideen und Begegnungen.',
    ctaLabel: 'Alle Meetingräume',
    slideFallback: {
      alt: 'Tagungsraum im Hotel Berlin, Berlin mit Tageslicht und Konferenzbestuhlung',
      caption: 'Berlin 3',
    },
  },
}

export async function getMeetAndWork(locale: 'de' | 'en'): Promise<MeetAndWorkCopy> {
  const defaults = meetAndWorkDefaults[locale]
  const fallbackSlides: MeetAndWorkSlide[] = [
    {
      id: 'fallback',
      src: MEET_AND_WORK_PHOTO_FALLBACK,
      alt: defaults.slideFallback.alt,
      caption: defaults.slideFallback.caption,
    },
  ]

  try {
    const payload = await getPayloadClient()
    const hotel = (await payload.findGlobal({
      slug: 'hotel',
      locale,
      depth: 1,
    })) as Hotel

    const block = hotel.meetAndWork
    const slides =
      block?.slides
        ?.map((slide, index) => {
          const src = mediaUrl(slide.image)
          if (!src) return null
          return {
            id: slide.id ?? `slide-${index}`,
            src,
            alt: slide.imageAlt?.trim() || defaults.slideFallback.alt,
            caption: slide.caption?.trim() || '',
          } satisfies MeetAndWorkSlide
        })
        .filter((slide): slide is MeetAndWorkSlide => slide !== null) ?? []

    return {
      kicker: block?.kicker?.trim() || defaults.kicker,
      subhead: block?.subhead?.trim() || defaults.subhead,
      body: block?.body?.trim() || defaults.body,
      ctaLabel: block?.ctaLabel?.trim() || defaults.ctaLabel,
      slides: slides.length > 0 ? slides : fallbackSlides,
    }
  } catch {
    return {
      kicker: defaults.kicker,
      subhead: defaults.subhead,
      body: defaults.body,
      ctaLabel: defaults.ctaLabel,
      slides: fallbackSlides,
    }
  }
}

export type EatAndDrinkCopy = {
  kicker: string
  heading: string
  body: string
  ctaLabel: string
  image: { src: string; alt: string }
}

const EAT_AND_DRINK_PHOTO_FALLBACK = '/images/food-interior.jpg'

const eatAndDrinkDefaults: Record<'de' | 'en', EatAndDrinkCopy> = {
  en: {
    kicker: 'Eat & Drink',
    heading: 'The place to eat, play, and hang all day.',
    body: 'In the heart of the hotel — open to guests and Berliners alike. Breakfast from the counter. Lunch on the terrace. Cocktails until the city stops. Happy hour isn\'t a time slot. It\'s a state of mind.',
    ctaLabel: 'Eat & Drink',
    image: {
      src: EAT_AND_DRINK_PHOTO_FALLBACK,
      alt: 'Lütze interior at Hotel Berlin, Berlin',
    },
  },
  de: {
    kicker: 'Essen & Trinken',
    heading: 'Der Ort zum Essen, Spielen und Verweilen.',
    body: 'Im Herzen des Hotels — offen für Gäste und Berliner. Frühstück an der Theke. Mittagessen auf der Terrasse. Cocktails bis die Stadt schläft. Happy Hour ist kein Zeitfenster. Es ist eine Einstellung.',
    ctaLabel: 'Essen & Trinken',
    image: {
      src: EAT_AND_DRINK_PHOTO_FALLBACK,
      alt: 'Lütze-Interieur im Hotel Berlin, Berlin',
    },
  },
}

export async function getEatAndDrink(locale: 'de' | 'en'): Promise<EatAndDrinkCopy> {
  const defaults = eatAndDrinkDefaults[locale]

  try {
    const payload = await getPayloadClient()
    const hotel = (await payload.findGlobal({
      slug: 'hotel',
      locale,
      depth: 1,
    })) as Hotel

    const block = hotel.eatAndDrink
    const cmsSrc = mediaUrl(block?.image)
    // CMS media can 404 on HEAD / miss files — prefer public fallback when unset
    const src = cmsSrc || defaults.image.src

    return {
      kicker: block?.kicker?.trim() || defaults.kicker,
      heading: block?.heading?.trim() || defaults.heading,
      body: block?.body?.trim() || defaults.body,
      ctaLabel: block?.ctaLabel?.trim() || defaults.ctaLabel,
      image: {
        // Use stable public asset if CMS points at a fragile media path
        src: src.startsWith('/api/media/') ? defaults.image.src : src,
        alt: block?.imageAlt?.trim() || defaults.image.alt,
      },
    }
  } catch {
    return defaults
  }
}
