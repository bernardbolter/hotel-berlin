import { ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { MapboxStaticImage } from '@/components/map/MapboxStaticImage'
import { HintDot } from '@/components/primitives/HintDot'
import { HotelDiscPin } from '@/components/primitives/HotelDiscPin'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { mapBackgroundImage } from '@/lib/data/homepageImages'
import { coordsToPercent, getPinVariant, HOTEL_COORDS } from '@/lib/map/staticPins'
import { getMapSettings } from '@/lib/map/settings'
import { getFeaturedPlaces } from '@/lib/queries/places'

import { Link } from '@/i18n/routing'

export async function MapTeaser() {
  const t = await getTranslations('map')
  const mapSettings = await getMapSettings()
  const featuredPlaces = getFeaturedPlaces().filter((p) => p.slug !== 'hotel-berlin-berlin')
  const hotelPosition = coordsToPercent(HOTEL_COORDS.lat, HOTEL_COORDS.lng)

  return (
    <section aria-labelledby="map-heading" className="bg-hbb-page px-section-sm py-section-y md:px-section-x">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          id="map-heading"
          label={t('label')}
          title={t('title')}
          subtitle={t('subtitle')}
        />
        <p className="font-ui text-ui-sm text-gray-500">{t('walkNote')}</p>
      </div>

      <div className="relative mb-2 aspect-16/7 min-h-55 overflow-hidden border border-gray-200">
        <div aria-hidden="true" className="absolute inset-0">
          <MapboxStaticImage
            bounds={mapSettings.bounds}
            width={1280}
            height={560}
            fallbackSrc={mapBackgroundImage}
            className="h-full w-full object-cover opacity-95"
          />
          <div className="absolute inset-0 bg-hbb-teal-deep/10" />

          <HotelDiscPin style={{ top: hotelPosition.top, left: hotelPosition.left }} />

          {featuredPlaces.map((place) => {
            const position = coordsToPercent(place.location.lat, place.location.lng)
            return (
              <HintDot
                key={place.id}
                variant={getPinVariant(place)}
                style={{ top: position.top, left: position.left }}
              />
            )
          })}
        </div>
      </div>

      <p className="mb-6 text-right font-ui text-[10px] text-gray-400">
        <a
          href="https://www.mapbox.com/about/maps/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600"
        >
          © Mapbox
        </a>
        {' · '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600"
        >
          © OpenStreetMap
        </a>
      </p>

      <Link
        href="/neighbourhood"
        className="inline-flex items-center gap-1.5 font-ui text-ui-sm font-medium text-hbb-teal"
      >
        {t('cta')}
        <ArrowRight aria-hidden="true" size={13} />
      </Link>
    </section>
  )
}
