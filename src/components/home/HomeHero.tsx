import { getLocale, getTranslations } from 'next-intl/server'

import { getHeroMapCopy, getHeroSlides } from '@/lib/payload/homepage'
import { getMapSettings } from '@/lib/map/settings'

import { HeroMapTeaser } from './HeroMapTeaser'
import { HomeHeroLayout } from './HomeHeroLayout'

export async function HomeHero() {
  const locale = (await getLocale()) as 'de' | 'en'
  const t = await getTranslations('hero')
  const slides = await getHeroSlides()
  const mapSettings = await getMapSettings()
  const mapCopy = await getHeroMapCopy(locale)

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
          imageSrc={mapCopy.imageUrl ?? undefined}
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
