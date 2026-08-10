import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { RichTextParagraphs } from '@/components/primitives/RichTextParagraphs'
import { SweepCta } from '@/components/primitives/SweepCta'
import { RoomAmenityGrid } from '@/components/rooms/RoomAmenityGrid'
import { RoomFeatureIcons } from '@/components/rooms/RoomFeatureIcons'
import { RoomGallery } from '@/components/rooms/RoomGallery'
import { RoomSpecStrip } from '@/components/rooms/RoomSpecStrip'
import { Link } from '@/i18n/routing'
import {
  buildHotelRoomPageGraph,
  defaultConfig,
} from '@/lib/aeo-schema/src/index'
import { getRoomBySlug, getRoomSlugs } from '@/lib/payload/rooms'
import { mapRoomToAeo } from '@/lib/rooms/mapRoomToAeo'
import { getBathroomLabel } from '@/lib/rooms/bathroomLabels'
import {
  resolveLocale,
  roomAmenities,
  roomCanonicalPath,
  roomHeroFields,
} from '@/lib/rooms/roomPage'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getRoomSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

function resolveSocialImage(room: NonNullable<Awaited<ReturnType<typeof getRoomBySlug>>>) {
  const social = room.socialImage
  if (social && typeof social === 'object' && social.url) {
    return {
      url: social.url.startsWith('http')
        ? social.url
        : `https://hotel-berlin.de${social.url}`,
      alt: social.alt ?? room.name,
    }
  }

  const first = room.images?.[0]
  if (!first) return null
  const media = first.image
  if (!media || typeof media === 'number' || !media.url) return null

  return {
    url: media.url.startsWith('http')
      ? media.url
      : `https://hotel-berlin.de${media.url}`,
    alt: first.alt || media.alt || room.name,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, slug } = await params
  const locale = resolveLocale(localeParam)
  const room = await getRoomBySlug(slug, locale)
  if (!room) return { title: 'Not found' }

  const path = roomCanonicalPath(locale, slug)
  const socialImage = resolveSocialImage(room)

  return {
    title: `${room.name} | Hotel Berlin, Berlin`,
    description: room.shortDescription ?? undefined,
    alternates: {
      canonical: `https://hotel-berlin.de${path}`,
      languages: {
        de: `https://hotel-berlin.de${roomCanonicalPath('de', slug)}`,
        en: `https://hotel-berlin.de${roomCanonicalPath('en', slug)}`,
        'x-default': `https://hotel-berlin.de${roomCanonicalPath('de', slug)}`,
      },
    },
    ...(socialImage
      ? {
          openGraph: {
            images: [{ url: socialImage.url, alt: socialImage.alt }],
          },
          twitter: {
            card: 'summary_large_image',
            images: [socialImage.url],
          },
        }
      : {}),
  }
}

export default async function RoomDetailPage({ params }: Props) {
  const { locale: localeParam, slug } = await params
  const locale = resolveLocale(localeParam)
  const t = await getTranslations('rooms')
  const room = await getRoomBySlug(slug, locale)

  if (!room) notFound()

  const hero = roomHeroFields(room, locale, t('from'))
  const amenities = roomAmenities(room)
  const graph = buildHotelRoomPageGraph(mapRoomToAeo(room), defaultConfig, {
    home: t('breadcrumbHome'),
    rooms: t('breadcrumbRooms'),
  })
  const bathroomDisplay =
    room.bathroomDescription?.trim() ||
    getBathroomLabel(room.bathroomLabel, locale) ||
    '–'

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page">
        <div className="mx-auto max-w-5xl px-section-sm pt-section-y md:px-section-x">
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
              <li>
                <Link href="/rooms" className="hover:underline">
                  {t('breadcrumbRooms')}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-500" aria-current="page">
                {room.name}
              </li>
            </ol>
          </nav>

          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h1 className="font-ui text-[clamp(1.75rem,3.5vw,2.5rem)] font-medium leading-[1.15] text-hbb-rooms-highlight">
              {room.name}
            </h1>
            <p className="font-ui text-ui-xl font-medium text-hbb-rooms-highlight md:text-[28px]">
              <span className="sr-only">{t('priceScreenReader')} </span>
              <span className="text-ui-sm font-normal uppercase tracking-wider text-gray-400">
                {t('from')}{' '}
              </span>
              {hero.priceLabel}
            </p>
          </div>
        </div>

        <RoomGallery
          className="mt-8"
          images={hero.images.map((img, index) => {
            const media = room.images?.[index]?.image
            const dims =
              media && typeof media === 'object'
                ? { width: media.width ?? undefined, height: media.height ?? undefined }
                : {}
            return {
              src: img.src,
              alt: img.alt,
              caption: room.images?.[index]?.caption ?? null,
              ...dims,
            }
          })}
          ariaLabel={t('galleryAria')}
          prevLabel={t('prevImage')}
          nextLabel={t('nextImage')}
          counterTemplate="{current} / {total}"
        />

        <div className="mx-auto max-w-5xl px-section-sm pb-section-y md:px-section-x">
          <RoomSpecStrip
            className="mt-10"
            items={[
              { icon: 'size', label: t('specSize'), value: hero.sizeLabel },
              { icon: 'bed', label: t('specBed'), value: hero.bedLabel },
              { icon: 'occupancy', label: t('specSleeps'), value: hero.sleepsLabel },
              { icon: 'bathroom', label: t('specBathroom'), value: bathroomDisplay },
            ]}
          />

          <RoomFeatureIcons
            className="mt-6"
            hasBalcony={room.hasBalcony}
            hasSauna={room.hasSauna}
            hasSeparateLiving={room.hasSeparateLiving}
            isAccessible={room.isAccessible}
            labels={{
              balcony: t('featureBalcony'),
              sauna: t('featureSauna'),
              separateLiving: t('featureSeparateLiving'),
              accessible: t('featureAccessible'),
            }}
          />

          {room.shortDescription && !room.description ? (
            <p className="mt-10 max-w-2xl font-serif text-serif-md text-gray-700">
              {room.shortDescription}
            </p>
          ) : null}

          <RichTextParagraphs
            value={room.description}
            className="mt-10 max-w-2xl"
            paragraphClassName="font-serif text-serif-md text-gray-700"
          />

          {room.bookingUrl ? (
            <SweepCta href={room.bookingUrl} external color="terracotta" className="mt-8">
              {t('ctaAvailability')}
            </SweepCta>
          ) : null}

          <RoomAmenityGrid
            className="mt-14"
            amenities={amenities}
            heading={t('amenitiesHeading')}
          />

          <div className="mt-14 border-t border-gray-200 pt-10">
            <SweepCta href="/rooms" color="ink">
              {t('allRooms')}
            </SweepCta>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
