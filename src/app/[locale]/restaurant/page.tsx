import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { OpenStatusBadge } from '@/components/primitives/OpenStatusBadge'
import { RichTextParagraphs } from '@/components/primitives/RichTextParagraphs'
import { SweepCta } from '@/components/primitives/SweepCta'
import { RoomGallery } from '@/components/rooms/RoomGallery'
import { Link } from '@/i18n/routing'
import {
  buildVenuePageGraph,
  defaultConfig,
} from '@/lib/aeo-schema/src/index'
import { getEatAndDrink } from '@/lib/payload/homepage'
import { getHotel, guestStayFromHotel } from '@/lib/payload/hotel'
import { getVenueBySlug } from '@/lib/payload/venues'
import {
  formatVenueHoursSegments,
  localizeHoursSegmentLabel,
  toOpeningHoursEntries,
} from '@/lib/venues/formatHours'
import {
  mapVenueToAeo,
  resolveLocale,
  restaurantCanonicalPath,
  venueGalleryImages,
} from '@/lib/venues/mapVenueToAeo'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params
  const locale = resolveLocale(localeParam)
  const t = await getTranslations({ locale, namespace: 'restaurantPage' })
  const venue = await getVenueBySlug('lutze', locale).catch(() => null)
  const path = restaurantCanonicalPath(locale)

  return {
    title: t('metaTitle'),
    description: venue?.shortDescription || t('metaDescription'),
    alternates: {
      canonical: `https://hotel-berlin.de${path}`,
      languages: {
        de: `https://hotel-berlin.de${restaurantCanonicalPath('de')}`,
        en: `https://hotel-berlin.de${restaurantCanonicalPath('en')}`,
        'x-default': `https://hotel-berlin.de${restaurantCanonicalPath('de')}`,
      },
    },
  }
}

export default async function RestaurantPage({ params }: Props) {
  const { locale: localeParam } = await params
  const locale = resolveLocale(localeParam)
  const t = await getTranslations('restaurantPage')

  const [venue, eatAndDrink, hotel] = await Promise.all([
    getVenueBySlug('lutze', locale),
    getEatAndDrink(locale),
    getHotel(locale).catch(() => null),
  ])

  if (!venue) notFound()

  const breakfast = guestStayFromHotel(hotel)
  const hoursEntries = toOpeningHoursEntries(venue.openingHours)
  const hourSegments = formatVenueHoursSegments(hoursEntries, t('openEnd'))
  const gallery = venueGalleryImages(venue, eatAndDrink.image)
  const graph = buildVenuePageGraph(mapVenueToAeo(venue), defaultConfig, {
    home: t('breadcrumbHome'),
    restaurant: t('breadcrumbRestaurant'),
  })

  const cuisineLine = [venue.servesCuisine, venue.priceRange].filter(Boolean).join(' · ')
  const intro = venue.shortDescription || eatAndDrink.body

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page">
        <div className="mx-auto max-w-5xl px-section-sm pt-section-y md:px-section-x">
          <nav aria-label="Breadcrumb" className="font-ui text-ui-sm text-gray-400">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:underline">
                  {t('breadcrumbHome')}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-500" aria-current="page">
                {t('breadcrumbRestaurant')}
              </li>
            </ol>
          </nav>

          <h1 className="mt-6 font-ui text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-[1.15] text-hbb-nav-amber">
            {venue.name}
          </h1>
          {venue.tagline ? (
            <p className="mt-2 max-w-2xl font-serif text-serif-md text-gray-600">{venue.tagline}</p>
          ) : null}
        </div>

        {gallery.length > 0 ? (
          <RoomGallery
            className="mt-8"
            images={gallery}
            ariaLabel={t('galleryAria')}
            prevLabel={t('prevImage')}
            nextLabel={t('nextImage')}
            counterTemplate="{current} / {total}"
          />
        ) : null}

        <div className="mx-auto max-w-5xl px-section-sm pb-section-y md:px-section-x">
          {hoursEntries.length > 0 ? (
            <div className="mt-10">
              <OpenStatusBadge openingHours={hoursEntries} />
            </div>
          ) : null}

          {hourSegments.length > 0 ? (
            <section className="mt-8" aria-labelledby="hours-heading">
              <h2
                id="hours-heading"
                className="font-ui text-[11px] font-medium uppercase tracking-[0.06em] text-gray-500"
              >
                {t('hoursHeading')}
              </h2>
              <dl className="mt-3 max-w-xl">
                {hourSegments.map((segment) => (
                  <div
                    key={segment.label}
                    className="grid grid-cols-[7.5rem_1fr] gap-x-3 border-b border-gray-100 py-2.5 last:border-b-0 sm:grid-cols-[8.5rem_1fr]"
                  >
                    <dt className="font-ui text-ui-sm text-gray-500">
                      {localizeHoursSegmentLabel(segment.label, {
                        kitchen: t('segmentKitchen'),
                        bar: t('segmentBar'),
                      })}
                    </dt>
                    <dd className="font-ui text-ui-sm text-hbb-black">{segment.body}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {cuisineLine ? (
            <p className="mt-6 font-ui text-ui-sm text-gray-600">{cuisineLine}</p>
          ) : null}

          {venue.location ? (
            <p className="mt-2 font-ui text-ui-sm text-gray-500">{venue.location}</p>
          ) : null}

          <RichTextParagraphs
            value={venue.description}
            className="mt-10 max-w-2xl"
            paragraphClassName="font-serif text-serif-md text-gray-700"
          />

          {!venue.description && intro ? (
            <p className="mt-10 max-w-2xl font-serif text-serif-md text-gray-700">{intro}</p>
          ) : null}

          {(venue.menuUrl || venue.reservationUrl) && (
            <div className="mt-8 flex flex-wrap gap-6">
              {venue.menuUrl ? (
                <SweepCta href={venue.menuUrl} external color="nav-amber">
                  {t('menuCta')}
                </SweepCta>
              ) : null}
              {venue.reservationUrl ? (
                <SweepCta href={venue.reservationUrl} external color="nav-amber">
                  {t('reserveCta')}
                </SweepCta>
              ) : null}
            </div>
          )}

          <section className="mt-14 border-t border-gray-200 pt-10" aria-labelledby="breakfast-heading">
            <h2
              id="breakfast-heading"
              className="font-ui text-[11px] font-medium uppercase tracking-[0.06em] text-gray-500"
            >
              {t('breakfastHeading')}
            </h2>
            <dl className="mt-3 max-w-xl">
              <div className="grid grid-cols-[7.5rem_1fr] gap-x-3 border-b border-gray-100 py-2.5 sm:grid-cols-[8.5rem_1fr]">
                <dt className="font-ui text-ui-sm text-gray-500">{t('breakfastHours')}</dt>
                <dd className="font-ui text-ui-sm text-hbb-black">{breakfast.breakfastHours}</dd>
              </div>
              {breakfast.breakfastLocation ? (
                <div className="grid grid-cols-[7.5rem_1fr] gap-x-3 py-2.5 sm:grid-cols-[8.5rem_1fr]">
                  <dt className="font-ui text-ui-sm text-gray-500">{t('breakfastWhere')}</dt>
                  <dd className="font-ui text-ui-sm text-hbb-black">{breakfast.breakfastLocation}</dd>
                </div>
              ) : null}
            </dl>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
