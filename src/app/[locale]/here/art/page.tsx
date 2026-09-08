import { getTranslations } from 'next-intl/server'

import { ArtLocationCard } from '@/components/here/ArtLocationCard'
import { HereFactGroup } from '@/components/here/HereFactGroup'
import { HereSubpage } from '@/components/here/HereSubpage'
import { LineCta } from '@/components/primitives/LineCta'
import { herePageMetadata } from '@/lib/here/canonical'
import { HERE_IMAGES } from '@/lib/here/images'
import { resolveTonightHero } from '@/lib/here/tonight'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'here' })
  return herePageMetadata('/here/art', locale, t('pages.art.title'), t('pages.art.intro'))
}

export default async function HereArtPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('here')
  const show = await resolveTonightHero(locale)

  return (
    <HereSubpage
      kicker={t('inProgress')}
      title={t('pages.art.title')}
      intro={t('pages.art.intro')}
      backLabel={t('backToHub')}
    >
      <HereFactGroup
        title={t('pages.art.fkkbTitle')}
        items={[
          {
            label: t('pages.art.current'),
            body: show.title,
          },
          { label: t('pages.art.where'), body: t('pages.art.fkkbWhere') },
          { label: t('pages.art.entry'), body: t('pages.art.fkkbEntry') },
        ]}
      />

      <h2 className="mt-8 mb-3 font-ui text-ui-md font-medium text-hbb-black">
        {t('pages.art.onTheWalls')}
      </h2>
      <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 md:grid-cols-4">
        <div id="somari" className="scroll-mt-28">
          <ArtLocationCard
            floorLabel={t('art.floors.somari.floor')}
            title={t('art.floors.somari.title')}
            href="/here/art"
            image={HERE_IMAGES.muralSomari}
          />
        </div>
        <div id="deerbln" className="scroll-mt-28">
          <ArtLocationCard
            floorLabel={t('art.floors.deerbln.floor')}
            title={t('art.floors.deerbln.title')}
            href="/here/art"
            image={HERE_IMAGES.muralDeer}
          />
        </div>
        <div id="pisa73" className="scroll-mt-28">
          <ArtLocationCard
            floorLabel={t('art.floors.pisa73.floor')}
            title={t('art.floors.pisa73.title')}
            href="/here/art"
            image={HERE_IMAGES.muralPisa}
          />
        </div>
        <div id="wallride" className="scroll-mt-28">
          <ArtLocationCard
            floorLabel={t('art.floors.wallride.floor')}
            title={t('art.floors.wallride.title')}
            href="/here/wallride"
            image={HERE_IMAGES.wallride}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <LineCta href="/here/gallery" className="text-ui-sm">
          {t('pages.art.galleryCta')}
        </LineCta>
        <LineCta href="/here/wallride" className="text-ui-sm">
          {t('pages.art.wallrideCta')}
        </LineCta>
      </div>
    </HereSubpage>
  )
}
