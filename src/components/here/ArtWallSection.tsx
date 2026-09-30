import { getTranslations } from 'next-intl/server'

import { ArtWall } from '@/components/here/ArtWall'
import { HubSerifHeading } from '@/components/here/HubSerifHeading'
import {
  SectionShell,
  type LightSectionBackground,
} from '@/components/layout/SectionShell'
import { getArtWallData } from '@/lib/here/getArtWall'

type Props = {
  locale: string
  background: LightSectionBackground
}

/** Heading contained; mosaic full-bleed — same structure as the map section. */
export async function ArtWallSection({ locale, background }: Props) {
  const t = await getTranslations('here')
  const data = await getArtWallData(locale, {
    nowUntil: (date) => t('artWall.nowUntil', { date }),
    nowChip: t('artWall.nowChip'),
    permanentChip: t('artWall.permanentChip'),
    fromDate: (date) => t('artWall.fromDate', { date }),
    locationTbc: t('artWall.locationTbc'),
    moreWithCount: (count) => t('artWall.moreCount', { count }),
    moreWithoutCount: t('artWall.more'),
  })

  if (!data) return null

  return (
    <SectionShell
      as="section"
      background={background}
      aria-labelledby="here-art-heading"
    >
      <div className="site-shell px-section-sm pb-6 pt-section-y md:px-section-x">
        <HubSerifHeading
          id="here-art-heading"
          title={t('artInBuilding')}
          href="/here/art"
          cta={t('art.programmeCta')}
          ctaColor="ctx"
        />
      </div>
      <ArtWall tiles={data.tiles} moreLabel={t('artWall.seeAll')} columns={data.columns} />
    </SectionShell>
  )
}
