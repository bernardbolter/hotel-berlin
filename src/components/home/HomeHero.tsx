import { getTranslations } from 'next-intl/server'

import { HomeHeroLayout } from './HomeHeroLayout'
import { MiniSatellite } from './MiniSatellite'

export async function HomeHero() {
  const t = await getTranslations('hero')

  return (
    <div className="w-full overflow-x-auto">
      <HomeHeroLayout
        copy={{
          headingLine1: t('headingLine1'),
          headingLine2: t('headingLine2'),
          galleryAria: t('galleryAria'),
        }}
        satellite={
          <MiniSatellite
            satelliteAlt={t('satelliteAlt')}
            mapsAriaLabel={t('mapsLink')}
            address={t('address')}
            directions={t('directions')}
          />
        }
      />
    </div>
  )
}
