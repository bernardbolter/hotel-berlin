import { getTranslations } from 'next-intl/server'

import { LineCta } from '@/components/primitives/LineCta'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { getMapboxAccessToken } from '@/lib/map/config'

import { NeighbourhoodMapCanvas } from './NeighbourhoodMapCanvas'

/**
 * Full-bleed neighbourhood map scaffold for the homepage.
 * Heading sits in padded `.site-shell`; the canvas spans the full viewport width
 * (section is already outside `.site-shell` on the homepage — no 100vw breakout).
 */
export async function NeighbourhoodMapSection() {
  const t = await getTranslations('map')
  const accessToken = getMapboxAccessToken()

  return (
    <section aria-labelledby="neighbourhood-map-heading" className="bg-hbb-page">
      <div className="site-shell px-section-sm pb-6 pt-section-y md:px-section-x">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="neighbourhood-map-heading"
            label={t('label')}
            title={t('title')}
            subtitle={t('subtitle')}
          />
          <LineCta href="/neighbourhood">{t('cta')}</LineCta>
        </div>
      </div>

      <div className="w-full overflow-hidden">
        {accessToken ? (
          <NeighbourhoodMapCanvas accessToken={accessToken} />
        ) : (
          <div
            className="flex h-[min(70vh,640px)] min-h-100 w-full items-center justify-center border-y border-gray-200 bg-gray-100"
            role="img"
            aria-label={t('title')}
          >
            <p className="max-w-md px-6 text-center font-ui text-ui-sm text-gray-500">
              {t('mapUnavailable')}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
