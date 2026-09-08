import { getTranslations } from 'next-intl/server'

import { ArtWall } from '@/components/here/ArtWall'
import { HubSerifHeading } from '@/components/here/HubSerifHeading'
import { getArtWallData } from '@/lib/here/getArtWall'

type Props = {
  locale: string
}

/** Heading contained; mosaic full-bleed — same structure as the map section. */
export async function ArtWallSection({ locale }: Props) {
  const t = await getTranslations('here')
  const data = await getArtWallData(locale, {
    nowUntil: (date) => t('artWall.nowUntil', { date }),
    nowChip: t('artWall.nowChip'),
    locationTbc: t('artWall.locationTbc'),
    moreWithCount: (count) => t('artWall.moreCount', { count }),
    moreWithoutCount: t('artWall.more'),
    floors: {
      somari: {
        floor: t('art.floors.somari.floor'),
        title: t('art.floors.somari.title'),
      },
      deerbln: {
        floor: t('art.floors.deerbln.floor'),
        title: t('art.floors.deerbln.title'),
      },
      pisa73: {
        floor: t('art.floors.pisa73.floor'),
        title: t('art.floors.pisa73.title'),
      },
    },
  })

  return (
    <section aria-labelledby="here-art-heading" className="bg-hbb-page">
      <div className="site-shell px-section-sm pb-6 pt-section-y md:px-section-x">
        <HubSerifHeading
          id="here-art-heading"
          title={t('artInBuilding')}
          href="/here/art"
          cta={t('art.programmeCta')}
          ctaColor="ctx"
        />
      </div>
      <ArtWall tiles={data.tiles} moreLabel={t('artWall.seeAll')} />
    </section>
  )
}
