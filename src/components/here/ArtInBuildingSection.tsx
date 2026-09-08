import { getTranslations } from 'next-intl/server'

import { ArtLocationCard } from '@/components/here/ArtLocationCard'
import { HubSerifHeading } from '@/components/here/HubSerifHeading'
import { EditorialBand } from '@/components/primitives/EditorialBand'
import { HERE_IMAGES } from '@/lib/here/images'
import { resolveTonightHero } from '@/lib/here/tonight'
import { getVenueBySlug } from '@/lib/payload/venues'
import { resolveVenueSpotlight } from '@/lib/spotlight/resolvers'

type Props = {
  locale: string
}

const FLOORS = [
  { key: 'somari', href: '/here/art', image: HERE_IMAGES.muralSomari },
  { key: 'deerbln', href: '/here/art', image: HERE_IMAGES.muralDeer },
  { key: 'pisa73', href: '/here/art', image: HERE_IMAGES.muralPisa },
] as const

export async function ArtInBuildingSection({ locale }: Props) {
  const t = await getTranslations('here')
  const show = await resolveTonightHero(locale)

  let liveImage = show.image
  let liveTitle = show.title
  let liveBody = t('art.currentDescription')
  try {
    const fkkb = await getVenueBySlug('fkkb', locale === 'de' ? 'de' : 'en')
    if (fkkb) {
      const liveShow = await resolveVenueSpotlight(fkkb, { locale })
      if (liveShow?.image?.src) liveImage = liveShow.image
      if (liveShow?.title) liveTitle = liveShow.title
      if (liveShow?.description) liveBody = liveShow.description
    }
  } catch (error) {
    console.error('[ArtInBuildingSection] FKKB spotlight skipped:', error)
  }

  return (
    <section aria-labelledby="here-art-heading">
      <HubSerifHeading
        id="here-art-heading"
        title={t('artInBuilding')}
        href="/here/art"
        cta={t('art.programmeCta')}
      />
      <div className="flex flex-col gap-8">
        <EditorialBand
          ratio="1:2"
          heading={liveTitle}
          meta={show.meta}
          body={liveBody}
          image={liveImage}
          cta={{ href: '/here/art', label: t('art.currentCta') }}
        />
        <ul
          role="list"
          aria-label={t('art.rowAria')}
          className="grid grid-cols-1 gap-4 min-[560px]:grid-cols-2 lg:grid-cols-4"
        >
          {FLOORS.map((floor) => (
            <li key={floor.key} className="min-w-0">
              <ArtLocationCard
                floorLabel={t(`art.floors.${floor.key}.floor`)}
                title={t(`art.floors.${floor.key}.title`)}
                href={floor.href}
                image={floor.image}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
