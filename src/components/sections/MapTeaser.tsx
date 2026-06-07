import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

import { HintDot } from '@/components/primitives/HintDot'
import { HotelDiscPin } from '@/components/primitives/HotelDiscPin'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { mapBackgroundImage } from '@/lib/data/homepageImages'
import { coordsToPercent, getPinVariant, HOTEL_COORDS } from '@/lib/map/staticPins'
import { getFeaturedPlaces } from '@/lib/queries/places'

import { Link } from '@/i18n/routing'

export function MapTeaser() {
  const featuredPlaces = getFeaturedPlaces().filter((p) => p.slug !== 'hotel-berlin-berlin')
  const hotelPosition = coordsToPercent(HOTEL_COORDS.lat, HOTEL_COORDS.lng)

  return (
    <section aria-labelledby="map-heading" className="bg-hbb-page px-section-sm py-section-y md:px-section-x">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          id="map-heading"
          label="Neighbourhood"
          title="You're in the right part of Berlin"
          subtitle="Tiergarten, the canal, Ku'damm — all on foot"
        />
        <p className="font-ui text-ui-sm text-gray-500">Everything within 15 min on foot</p>
      </div>

      <div className="relative mb-6 aspect-[16/7] min-h-[220px] overflow-hidden border border-gray-200">
        <div aria-hidden="true" className="absolute inset-0">
          <Image
            src={mapBackgroundImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            style={{ objectFit: 'cover' }}
            className="opacity-90"
          />
          <div className="absolute inset-0 bg-hbb-teal-deep/20" />

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

      <Link
        href="/neighbourhood"
        className="inline-flex items-center gap-1.5 font-ui text-ui-sm font-medium text-hbb-teal"
      >
        Explore the neighbourhood
        <ArrowRight aria-hidden="true" size={13} />
      </Link>
    </section>
  )
}
