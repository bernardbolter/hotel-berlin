import { getLocale, getTranslations } from 'next-intl/server'

import { getHeroMapCopy, getHeroSlides } from '@/lib/payload/homepage'
import { buildMapboxStaticImageUrl } from '@/lib/map/mapbox'
import { getMapSettings } from '@/lib/map/settings'

import { HeroMapTeaser, HERO_MAP_SIZE_PX } from './HeroMapTeaser'
import { HomeHeroLayout } from './HomeHeroLayout'

export async function HomeHero() {
  const locale = (await getLocale()) as 'de' | 'en'
  const t = await getTranslations('hero')
  const slides = await getHeroSlides()
  const mapSettings = await getMapSettings()
  const mapCopy = await getHeroMapCopy(locale)

  const hotel = mapSettings.center
  // Bias center slightly south so pin + name sit above the directions strip
  const mapPreviewSrc =
    buildMapboxStaticImageUrl({
      center: {
        lat: hotel.lat - 0.0009,
        lng: hotel.lng,
      },
      zoom: 12.2,
      width: HERO_MAP_SIZE_PX,
      height: HERO_MAP_SIZE_PX,
      styleId: mapSettings.styleId,
      marker: { ...hotel, color: '56674F' },
    }) ?? undefined

  const body = [t('bodyLine1'), t('bodyLine2'), t('bodyLine3')].filter(Boolean).join(' ')

  return (
    <HomeHeroLayout
      slides={slides}
      copy={{
        headingLine1: t('headingLine1'),
        headingLine2: t('headingLine2'),
        body,
        galleryAria: t('galleryAria'),
      }}
      map={
        <HeroMapTeaser
          imageSrc={mapPreviewSrc}
          directionsUrl={mapSettings.directionsUrl}
          directionsLabel={mapCopy.directionsLabel}
          hotelName={mapSettings.hotelName}
          shortAddress={mapCopy.shortAddress}
          mapAlt={t('satelliteAlt')}
          linkLabel={t('mapsLink')}
        />
      }
    />
  )
}
