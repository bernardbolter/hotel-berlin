import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { RoomIndexCard } from '@/components/rooms/RoomIndexCard'
import { RoomsCompareTable } from '@/components/rooms/RoomsCompareTable'
import { RoomsNavRail } from '@/components/rooms/RoomsNavRail'
import { RoomsSuitesCallout } from '@/components/rooms/RoomsSuitesCallout'
import { FAQSection } from '@/components/sections/FAQSection'
import { Link } from '@/i18n/routing'
import {
  buildRoomsListGraph,
  defaultConfig,
} from '@/lib/aeo-schema/src/index'
import { getRoomsPageContent } from '@/lib/payload/hotel'
import { getAllRooms } from '@/lib/payload/rooms'
import { mapRoomToAeo } from '@/lib/rooms/mapRoomToAeo'
import {
  formatRoomPrice,
  resolveLocale,
  roomCanonicalPath,
  roomHeroFields,
} from '@/lib/rooms/roomPage'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params
  const locale = resolveLocale(localeParam)
  const t = await getTranslations({ locale, namespace: 'rooms' })
  const intro = await getRoomsPageContent(locale)
  const path = roomCanonicalPath(locale)

  return {
    title: `${intro.title ?? t('pageTitle')} | Hotel Berlin, Berlin`,
    description: intro.body ?? t('pageIntro'),
    alternates: {
      canonical: `https://hotel-berlin.de${path}`,
      languages: {
        de: `https://hotel-berlin.de${roomCanonicalPath('de')}`,
        en: `https://hotel-berlin.de${roomCanonicalPath('en')}`,
        'x-default': `https://hotel-berlin.de${roomCanonicalPath('de')}`,
      },
    },
  }
}

export default async function RoomsIndexPage({ params }: Props) {
  const { locale: localeParam } = await params
  const locale = resolveLocale(localeParam)
  const t = await getTranslations('rooms')

  const [rooms, pageContent] = await Promise.all([
    getAllRooms(locale),
    getRoomsPageContent(locale),
  ])

  const listGraph = buildRoomsListGraph(
    rooms.map((room) => mapRoomToAeo(room)),
    defaultConfig,
  )

  const title = pageContent.title ?? t('pageTitle')
  const body = pageContent.body ?? t('pageIntro')
  const suitesCallout = pageContent.suitesCallout

  const navRooms = rooms.map((room) => ({
    slug: room.slug,
    name: room.name,
  }))

  const compareRows = rooms.map((room) => ({
    slug: room.slug,
    name: room.name,
    floorSizeM2: room.floorSizeM2 ?? null,
    bedLabel: room.bedConfiguration?.details?.trim() || room.bedConfiguration?.type || '–',
    occupancyMax: room.occupancy?.maxTotal ?? room.occupancy?.maxAdults ?? null,
    bathroomLabel: room.bathroomLabel ?? null,
    fromPriceLabel: formatRoomPrice(room.fromPrice, locale),
    hasBalcony: Boolean(room.hasBalcony),
    hasSauna: Boolean(room.hasSauna),
    hasSeparateLiving: Boolean(room.hasSeparateLiving),
    isAccessible: Boolean(room.isAccessible),
  }))

  return (
    <>
      <JsonLdScript graph={listGraph} />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page">
        {/* Alternating room rows + scoped sticky rail */}
        <div className="relative px-section-sm pb-section-y pt-10 md:px-section-x">
          <RoomsNavRail rooms={navRooms} ariaLabel={t('navRailAria')} />

          <div className="mx-auto max-w-6xl" data-rooms-page-content>
            <header className="pb-10">
              <nav
                aria-label="Breadcrumb"
                className="font-ui text-ui-sm text-gray-400"
              >
                <ol className="flex flex-wrap items-center gap-2">
                  <li>
                    <Link href="/" className="hover:underline">
                      {t('breadcrumbHome')}
                    </Link>
                  </li>
                  <li aria-hidden="true">/</li>
                  <li className="text-gray-500" aria-current="page">
                    {t('breadcrumbRooms')}
                  </li>
                </ol>
              </nav>
              <div id="rooms-nav-inline" />
              <h1 className="mt-4 font-ui text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.1] text-hbb-rooms-highlight">
                {title}
              </h1>
              {body ? (
                <p className="mt-5 max-w-md font-serif text-serif-md text-gray-700 md:max-w-lg md:text-serif-lg">
                  {body}
                </p>
              ) : null}
            </header>

            {rooms.length === 0 ? (
              <p className="font-ui text-ui-sm text-gray-500">{t('empty')}</p>
            ) : (
              <ul className="flex flex-col gap-16 lg:gap-20">
                {rooms.map((room, index) => {
                  const hero = roomHeroFields(room, locale, t('from'))
                  const galleryImages =
                    hero.images.length > 0
                      ? hero.images
                      : [{ src: hero.teaserImage.src, alt: hero.teaserImage.alt }]
                  return (
                    <li key={room.id}>
                      <RoomIndexCard
                        slug={room.slug}
                        name={room.name}
                        fromPriceLabel={hero.priceLabel}
                        fromLabel={t('from')}
                        shortDescription={room.shortDescription ?? ''}
                        images={galleryImages}
                        bookingUrl={room.bookingUrl}
                        mediaOnLeft={index % 2 === 0}
                        readMoreLabel={t('readMore')}
                        bookLabel={t('bookCta')}
                        galleryAria={t('galleryAria')}
                        prevImageLabel={t('prevImage')}
                        nextImageLabel={t('nextImage')}
                      />

                      {suitesCallout &&
                      room.slug === suitesCallout.insertAfterSlug &&
                      suitesCallout.quote &&
                      suitesCallout.title ? (
                        <RoomsSuitesCallout
                          className="mt-16 lg:mt-20"
                          quote={suitesCallout.quote}
                          title={suitesCallout.title}
                          body={suitesCallout.body ?? ''}
                        />
                      ) : null}
                    </li>
                  )
                })}
              </ul>
            )}

            {pageContent.compareTableEnabled ? (
              <RoomsCompareTable
                className="mt-16 lg:mt-20"
                rooms={compareRows}
                locale={locale}
                labels={{
                  toggleOpen: t('compareOpen'),
                  toggleClose: t('compareClose'),
                  room: t('compareRoom'),
                  size: t('compareSize'),
                  bed: t('compareBed'),
                  occupancy: t('compareOccupancy'),
                  bathroom: t('compareBathroom'),
                  price: t('comparePrice'),
                  balcony: t('featureBalcony'),
                  sauna: t('featureSauna'),
                  separateLiving: t('featureSeparateLiving'),
                  accessible: t('featureAccessible'),
                }}
              />
            ) : null}
          </div>
        </div>

        <FAQSection context="prospect" category="general" />
      </main>
      <SiteFooter />
    </>
  )
}
