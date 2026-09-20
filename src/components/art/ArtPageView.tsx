import { getTranslations } from 'next-intl/server'

import { ArtGrid } from '@/components/art/ArtGrid'
import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { HereSubpage } from '@/components/here/HereSubpage'
import { HashOpen } from '@/components/primitives/HashOpen'
import { getArtPageData } from '@/lib/art/resolve'
import { buildArtJsonLd } from '@/lib/art/schema'

type Props = {
  locale: string
}

export async function ArtPageView({ locale }: Props) {
  const loc = locale === 'de' ? 'de' : 'en'
  const here = await getTranslations('here')
  const grid = await getTranslations('art.grid')

  const copy = {
    all: grid.raw('all'),
    lobby: grid('lobby'),
    floors1to4: grid('floors1to4'),
    floors5to10: grid('floors5to10'),
    basement: grid('basement'),
    by: grid.raw('by'),
    moreBy: grid.raw('moreBy'),
    untitled: grid('untitled'),
    close: grid('close'),
    emptyState: grid('emptyState'),
    locationTbc: here('artWall.locationTbc'),
    year: grid('year'),
    technique: grid('technique'),
    size: grid('size'),
    filtersAria: grid('filtersAria'),
  }

  const data = await getArtPageData(loc, {
    nowUntil: (date) => grid('nowUntil', { date }),
    nowChip: here('artWall.nowChip'),
  })

  return (
    <HereSubpage
      title={here('pages.art.title')}
      intro={here('pages.art.intro')}
      backLabel={here('backToHub')}
    >
      <HashOpen />
      <ArtGrid works={data.works} exhibition={data.exhibition} copy={copy} />
      {data.works.length > 0 ? <JsonLdScript graph={buildArtJsonLd(data.works)} /> : null}
    </HereSubpage>
  )
}
