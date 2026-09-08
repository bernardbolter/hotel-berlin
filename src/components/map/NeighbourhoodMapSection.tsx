import { getLocale, getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { HomepageMapTeaser, type MapTeaserPlace } from '@/components/map/HomepageMapTeaser'
import { SweepCta } from '@/components/primitives/SweepCta'
import { toAeoPlace } from '@/lib/aeo/mapToSchema'
import {
  buildNeighbourhoodListGraph,
  defaultConfig,
} from '@/lib/aeo-schema/src/index'
import { getMapSettings } from '@/lib/map/settings'
import { personGivenName, personInitials, personShortName } from '@/lib/people/initials'
import { getHeroMapCopy } from '@/lib/payload/homepage'
import {
  getMapTeaserPlaces,
  type NeighbourhoodPlaceDoc,
} from '@/lib/queries/neighbourhoodPlaces'
import type { TeaserContext } from '@/lib/places/getTeaserPlaces'
import { withPlaceImageFallback } from '@/lib/places/teaserImageFallbacks'
import type { NeighbourhoodPlace } from '@/payload-types'

/** Slightly under Rooms / Happenings title scale (Laica), off-black. */
const HEADING_CLASS =
  'text-left font-serif text-[clamp(1.45rem,2.3vw,2.1rem)] font-normal leading-[1.12] text-[#1F1F1F]'

function mediaUrl(image: NeighbourhoodPlaceDoc['image']): string | null {
  return typeof image === 'object' && image && image.url ? image.url : null
}

function mediaAlt(image: NeighbourhoodPlaceDoc['image']): string {
  return typeof image === 'object' && image && image.alt ? image.alt : ''
}

function toTeaserPlace(
  doc: NeighbourhoodPlaceDoc,
  categoryLabel: string,
  walkingLabel: string | undefined,
  transitLabel: string | undefined,
): MapTeaserPlace | null {
  const lat = doc.geo?.latitude
  const lng = doc.geo?.longitude
  if (lat == null || lng == null) return null

  const transitRaw = doc.transit
  const transit =
    transitRaw?.minutes != null && transitRaw.station && transitRaw.line
      ? {
          minutes: transitRaw.minutes,
          station: transitRaw.station,
          line: transitRaw.line,
        }
      : null

  const imageSrc = mediaUrl(doc.image)
  const creditText = doc.imageCredit?.creditText?.trim()
  const resolvedMedia = withPlaceImageFallback(
    doc.slug,
    imageSrc ? { src: imageSrc, alt: mediaAlt(doc.image) || doc.name } : null,
    creditText
      ? {
          creditText,
          creditUrl: doc.imageCredit?.creditUrl?.trim() || null,
        }
      : null,
    doc.name,
  )
  const endorsements =
    doc.endorsements
      ?.map((entry) => {
        const person = entry.person
        if (!person || typeof person !== 'object' || typeof person.slug !== 'string') {
          return null
        }
        return {
          person: {
            name: person.name,
            slug: person.slug,
            initials: personInitials(person.name),
          },
        }
      })
      .filter((e): e is NonNullable<typeof e> => e != null) ?? []

  const leadEntry = doc.endorsements?.find((entry) => {
    const person = entry.person
    return person && typeof person === 'object' && typeof person.slug === 'string'
  })
  const leadPerson = leadEntry?.person
  const leadEndorser =
    leadPerson && typeof leadPerson === 'object' && typeof leadPerson.slug === 'string'
      ? {
          name: leadPerson.name,
          givenName: personGivenName(leadPerson.name),
          shortName: personShortName(leadPerson.name),
          slug: leadPerson.slug,
          initials: personInitials(leadPerson.name),
          portraitUrl:
            typeof leadPerson.portrait === 'object' && leadPerson.portrait?.url
              ? leadPerson.portrait.url
              : null,
          jobTitle: leadPerson.jobTitle ?? null,
          quote: leadEntry?.quote ?? null,
        }
      : null

  return {
    id: String(doc.id),
    slug: doc.slug,
    name: doc.name,
    category: doc.category,
    categoryLabel,
    description: doc.description,
    walkingMinutes: doc.walkingMinutes,
    walkingLabel,
    priceRange: doc.priceRange ?? null,
    transit,
    transitLabel: transit ? transitLabel : undefined,
    image: resolvedMedia.image,
    imageCredit: resolvedMedia.imageCredit,
    endorsements,
    leadEndorser,
    latitude: lat,
    longitude: lng,
  }
}

type Props = {
  context?: TeaserContext
  /** Place-first (home) vs person-first (/here). Same map, flipped reading. */
  framing?: 'place' | 'endorser'
  /** Defaults to `/neighbourhood`. Hub / explore pass `/here/explore`. */
  ctaHref?: '/neighbourhood' | '/here/explore'
  ctaLabel?: string
  /** @deprecated Compact /here chrome removed — section is full-bleed in both contexts. */
  layout?: 'section' | 'card'
}

/**
 * Neighbourhood map teaser — live Mapbox.
 * Homepage: featuredOrder 1–15 with side panel. `/here`: compact 5-place embed.
 */
export async function NeighbourhoodMapSection({
  context = 'homepage',
  framing = 'place',
  ctaHref = '/neighbourhood',
  ctaLabel,
}: Props = {}) {
  const locale = (await getLocale()) as 'de' | 'en'
  const t = await getTranslations('map')
  const tMap = await getTranslations('heroMap')
  const tCat = await getTranslations('neighbourhood.categories')
  const tWalk = await getTranslations('neighbourhood')
  const [mapSettings, mapCopy, featured] = await Promise.all([
    getMapSettings(),
    getHeroMapCopy(locale),
    getMapTeaserPlaces(locale, context),
  ])

  const places = featured
    .map((doc) => {
      const transitRaw = doc.transit
      const hasTransit =
        transitRaw?.minutes != null && Boolean(transitRaw.station) && Boolean(transitRaw.line)

      return toTeaserPlace(
        doc,
        tCat(doc.category),
        doc.walkingMinutes != null
          ? tWalk('walkingMinutes', { minutes: doc.walkingMinutes })
          : undefined,
        hasTransit && transitRaw
          ? tWalk('transitLine', {
              minutes: transitRaw.minutes!,
              line: transitRaw.line!,
              station: transitRaw.station!,
            })
          : undefined,
      )
    })
    .filter((p): p is MapTeaserPlace => p != null)

  const endorserPlaceCounts = new Map<string, number>()
  for (const place of places) {
    for (const entry of place.endorsements) {
      const slug = entry.person.slug
      endorserPlaceCounts.set(slug, (endorserPlaceCounts.get(slug) ?? 0) + 1)
    }
  }
  for (const place of places) {
    const slug = place.leadEndorser?.slug
    if (slug) place.endorserPlaceCount = endorserPlaceCounts.get(slug) ?? 0
  }

  const hotelAriaLabel = tMap('hotelBadgeAria', {
    hotelName: mapSettings.hotelName,
    address: mapCopy.shortAddress,
  })

  // JSON-LD only for the places shown on this teaser
  const schemaPlaces = featured
    .map((doc) => {
      try {
        return toAeoPlace(doc as unknown as NeighbourhoodPlace)
      } catch {
        return null
      }
    })
    .filter((p): p is NonNullable<typeof p> => p != null)
  const listGraph =
    schemaPlaces.length > 0
      ? buildNeighbourhoodListGraph(schemaPlaces, defaultConfig)
      : null

  const resolvedCta = ctaLabel ?? (framing === 'endorser' ? t('hereCta') : t('cta'))
  const heading = framing === 'endorser' ? t('hereTitle') : t('title')
  const headingId =
    framing === 'endorser' ? 'here-neighbourhood-map-heading' : 'neighbourhood-map-heading'
  const showHomepagePanel = framing === 'place' && context === 'homepage'

  const teaser = (
    <HomepageMapTeaser
      accessToken={mapSettings.accessToken}
      bounds={mapSettings.bounds}
      center={mapSettings.center}
      places={places}
      hotelName={mapSettings.hotelName}
      hotelAriaLabel={hotelAriaLabel}
      shortAddress={mapCopy.shortAddress}
      framing={framing}
      variant="full"
      showPlaceNav={showHomepagePanel}
    />
  )

  return (
    <section aria-labelledby={headingId} className="bg-hbb-page">
      {listGraph ? <JsonLdScript graph={listGraph} /> : null}
      <div className="site-shell px-section-sm pb-6 pt-section-y md:px-section-x">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id={headingId} className={HEADING_CLASS}>
            {heading}
          </h2>
          <SweepCta href={ctaHref} color="ink" edge="right" className="shrink-0">
            {resolvedCta}
          </SweepCta>
        </div>
      </div>

      <div className="w-full overflow-hidden border-t border-black/5">{teaser}</div>
    </section>
  )
}
