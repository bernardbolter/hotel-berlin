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
import { personInitials } from '@/lib/people/initials'
import { getHeroMapCopy } from '@/lib/payload/homepage'
import {
  getMapTeaserPlaces,
  type NeighbourhoodPlaceDoc,
} from '@/lib/queries/neighbourhoodPlaces'
import type { TeaserContext } from '@/lib/places/getTeaserPlaces'
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
  const imageCredit = creditText
    ? {
        creditText,
        creditUrl: doc.imageCredit?.creditUrl?.trim() || null,
      }
    : null
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

  return {
    id: String(doc.id),
    slug: doc.slug,
    name: doc.name,
    category: doc.category,
    categoryLabel,
    description: doc.description,
    walkingMinutes: doc.walkingMinutes,
    walkingLabel,
    transit,
    transitLabel: transit ? transitLabel : undefined,
    image: imageSrc ? { src: imageSrc, alt: mediaAlt(doc.image) || doc.name } : null,
    imageCredit,
    endorsements,
    latitude: lat,
    longitude: lng,
  }
}

type Props = {
  context?: TeaserContext
}

/**
 * Neighbourhood map teaser — full-bleed live Mapbox with curated pins (max 5).
 * Homepage (after Lutze / events) or `/here` via `context`.
 */
export async function NeighbourhoodMapSection({ context = 'homepage' }: Props = {}) {
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

  const accent = context === 'here' ? 'teal' : 'forest'

  return (
    <section aria-labelledby="neighbourhood-map-heading" className="bg-hbb-page">
      {listGraph ? <JsonLdScript graph={listGraph} /> : null}
      <div className="site-shell px-section-sm pb-6 pt-section-y md:px-section-x">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <h2 id="neighbourhood-map-heading" className={HEADING_CLASS}>
            {t('title')}
          </h2>
          <SweepCta href="/neighbourhood" color="ink" edge="right" className="shrink-0">
            {t('cta')}
          </SweepCta>
        </div>
      </div>

      <div className="w-full overflow-hidden border-t border-black/5">
        <HomepageMapTeaser
          accessToken={mapSettings.accessToken}
          bounds={mapSettings.bounds}
          center={mapSettings.center}
          places={places}
          hotelName={mapSettings.hotelName}
          hotelAriaLabel={hotelAriaLabel}
          shortAddress={mapCopy.shortAddress}
          accent={accent}
        />
      </div>
    </section>
  )
}
