import type { ReactNode } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'

import { getHeroMapCopy, getHeroSlides } from '@/lib/payload/homepage'
import { getMapSettings } from '@/lib/map/settings'

import { HeroMapTeaser } from './HeroMapTeaser'
import { HomeHeroLayout } from './HomeHeroLayout'

function headlineEm(chunks: ReactNode) {
  return <em className="home-hero__headline-em">{chunks}</em>
}

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
        headingLine1: t.rich('headingLine1', { em: headlineEm }),
        headingLine2: t.rich('headingLine2', { em: headlineEm }),
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
          linkLabel={t('mapsLink')}
        />
      }
    />
  )
}
