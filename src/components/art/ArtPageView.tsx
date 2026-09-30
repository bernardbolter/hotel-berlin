import { getTranslations } from 'next-intl/server'

import { ArtGrid } from '@/components/art/ArtGrid'
import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { LineCta } from '@/components/primitives/LineCta'
import { getArtPageData } from '@/lib/art/works'
import { buildArtIndexJsonLd } from '@/lib/art/schema'

type Props = {
  locale: string
}

export async function ArtPageView({ locale }: Props) {
  const loc = locale === 'de' ? 'de' : 'en'
  const here = await getTranslations('here')
  const page = await getTranslations('art.page')
  const grid = await getTranslations('art.grid')

  const data = await getArtPageData(loc, {
    nowUntil: (date) => grid('nowUntil', { date }),
    nowChip: here('artWall.nowChip'),
    permanentChip: here('artWall.permanentChip'),
  })

  const copy = {
    all: grid.raw('all'),
    outside: grid('outside'),
    lobby: grid('lobby'),
    floors1to4: grid('floors1to4'),
    floors5to10: grid('floors5to10'),
    basement: grid('basement'),
    exhibition: grid('exhibition'),
    untitled: grid('untitled'),
    emptyState: grid('emptyState'),
    locationTbc: here('artWall.locationTbc'),
    filtersAria: grid('filtersAria'),
    worksCount: page.raw('worksCount'),
    artistsHeading: page('artistsHeading'),
    workCountOne: page.raw('workCountOne'),
    workCountMany: page.raw('workCountMany'),
    onward: page('onward'),
    onwardCta: page('onwardCta'),
  }

  return (
    <main id="main-content" className="bg-hbb-page">
      {data.works.length > 0 ? (
        <JsonLdScript
          graph={buildArtIndexJsonLd(data.works, {
            name: page('title'),
            description: page('intro'),
          })}
        />
      ) : null}
      <div className="site-shell px-4 py-8 md:px-6 md:py-12">
        <div className="art-index__head">
          <div>
            <h1 className="art-index__h1">{page('title')}</h1>
            <p className="art-index__intro">{page('intro')}</p>
            <div className="mt-4">
              <LineCta href="/here" className="text-ui-sm">
                {here('backToHub')}
              </LineCta>
            </div>
          </div>
          <div className="art-index__count">
            <div className="art-index__count-n">{data.works.length}</div>
            <div className="art-index__count-l">
              {copy.worksCount.replace('{n}', String(data.works.length))}
            </div>
          </div>
        </div>

        <ArtGrid
          works={data.works}
          exhibitions={data.exhibitions}
          artists={data.artists}
          copy={copy}
        />
      </div>
    </main>
  )
}
