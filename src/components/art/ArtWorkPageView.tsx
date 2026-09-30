import Image from 'next/image'

import { FloorLocator } from '@/components/art/FloorLocator'
import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { RichTextParagraphs } from '@/components/primitives/RichTextParagraphs'
import { SweepCta } from '@/components/primitives/SweepCta'
import { Link } from '@/i18n/routing'
import { toAppHref } from '@/i18n/toAppHref'
import { floorLabel, isUntitledTitle, locationChip } from '@/lib/art/floors'
import { buildArtWorkJsonLd } from '@/lib/art/schema'
import type { ArtWork, ArtWorkExhibitionBand } from '@/lib/art/types'

export type ArtWorkPageCopy = {
  crumbHere: string
  crumbArt: string
  by: string
  year: string
  technique: string
  size: string
  inBuilding: string
  locationTbc: string
  moreBy: string
  moreByAll: string
  moreOnFloor: string
  moreOutside: string
  seeFloor: string
  seeOutside: string
  onward: string
  onwardCta: string
  exhibitionCta: string
  untitled: string
}

type Props = {
  work: ArtWork
  exhibition: ArtWorkExhibitionBand | null
  moreBy: ArtWork[]
  moreOnFloor: ArtWork[]
  copy: ArtWorkPageCopy
  locale?: 'de' | 'en'
}

function WorkTile({ work, untitled }: { work: ArtWork; untitled: string }) {
  const location = locationChip(work.floor, work.spot, '')
  return (
    <Link href={toAppHref(`/here/art/${work.slug}`)} className="art-grid__tile art-work__related-tile">
      {work.image ? (
        <Image
          src={work.image.src}
          alt={work.image.alt}
          fill
          sizes="(max-width: 700px) 33vw, 25vw"
          className="object-cover"
          style={work.image.objectPosition ? { objectPosition: work.image.objectPosition } : undefined}
        />
      ) : null}
      <span className="art-grid__cap">
        {location ? <span className="art-grid__where">{location}</span> : null}
        <span className="art-grid__who">{work.artist.name}</span>
        {work.title.trim() ? (
          <span className="art-grid__title">{work.title}</span>
        ) : (
          <span className="art-grid__title">{untitled}</span>
        )}
      </span>
    </Link>
  )
}

export function ArtWorkPageView({
  work,
  exhibition,
  moreBy,
  moreOnFloor,
  copy,
  locale = 'de',
}: Props) {
  const untitled = isUntitledTitle(work.title)
  const heading = untitled ? work.artist.name : work.title.trim()
  const crumbLeaf = untitled ? work.artist.name : work.title.trim()
  const floorText = work.floor ? floorLabel(work.floor, locale) : copy.locationTbc
  const outside = work.floor === 'outside'
  const personHref =
    work.artist.person?.published && work.artist.person.slug
      ? `/you-me-berlin/${work.artist.person.slug}`
      : null
  const byLabel = copy.by.replace('{artist}', work.artist.name)
  const details = [
    ...work.detailImages.slice(0, 2),
    ...(work.contextImage ? [work.contextImage] : []),
  ].slice(0, 3)

  const tall =
    work.image &&
    // Prefer portrait when we only have the card crop — default 4:3 landscape.
    false

  return (
    <main id="main-content" className="bg-hbb-page art-work">
      <JsonLdScript graph={buildArtWorkJsonLd(work)} />
      <div className="site-shell px-4 py-8 md:px-6 md:py-12">
        <nav className="art-work__crumb" aria-label="Breadcrumb">
          <Link href={toAppHref('/here')}>{copy.crumbHere}</Link>
          <i>/</i>
          <Link href={toAppHref('/here/art')}>{copy.crumbArt}</Link>
          <i>/</i>
          <span>{floorText}</span>
          <i>/</i>
          <span>{crumbLeaf}</span>
        </nav>

        <div className="art-work__top">
          <div>
            <div className={`art-work__photo${tall ? ' art-work__photo--tall' : ''}`}>
              {work.image ? (
                <Image
                  src={work.image.src}
                  alt={work.image.alt}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 60vw"
                  className="object-cover"
                  style={work.image.objectPosition ? { objectPosition: work.image.objectPosition } : undefined}
                />
              ) : null}
            </div>
            {details.length > 0 ? (
              <div className="art-work__details">
                {details.map((img, index) => (
                  <div key={`${img.src}-${index}`} className="art-work__detail">
                    <Image src={img.src} alt={img.alt} fill sizes="33vw" className="object-cover" />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="art-work__panel">
            <span className="art-grid__where art-grid__where--live">
              {locationChip(work.floor, work.spot, copy.locationTbc)}
            </span>
            <h1 className="art-work__h1">{heading}</h1>
            {!untitled ? (
              personHref ? (
                <Link href={toAppHref(personHref)} className="art-work__by">
                  {byLabel} →
                </Link>
              ) : (
                <p className="art-work__by art-work__by--plain">{byLabel}</p>
              )
            ) : null}
            {work.description ? (
              <RichTextParagraphs
                value={work.description}
                paragraphClassName="art-work__story"
              />
            ) : null}
            {work.floor ? (
              <FloorLocator
                floor={work.floor}
                spot={work.spot}
                kicker={copy.inBuilding}
                locale={locale}
              />
            ) : null}
            {work.year || work.technique || work.dimensions ? (
              <dl className="art-work__facts">
                {work.year ? (
                  <>
                    <dt>{copy.year}</dt>
                    <dd>{work.year}</dd>
                  </>
                ) : null}
                {work.technique ? (
                  <>
                    <dt>{copy.technique}</dt>
                    <dd>{work.technique}</dd>
                  </>
                ) : null}
                {work.dimensions ? (
                  <>
                    <dt>{copy.size}</dt>
                    <dd>{work.dimensions}</dd>
                  </>
                ) : null}
              </dl>
            ) : null}
          </div>
        </div>

        {exhibition ? (
          <div className={`art-work__exband${exhibition.current ? '' : ' is-past'}`}>
            <div>
              <div className="art-work__exband-t">{exhibition.line}</div>
            </div>
            <Link href={toAppHref(exhibition.href)} className="art-work__exband-cta">
              {copy.exhibitionCta}
            </Link>
          </div>
        ) : null}

        {moreBy.length > 0 ? (
          <section className="art-work__band">
            <div className="art-work__bandh">
              <h2>{copy.moreBy.replace('{artist}', work.artist.name)}</h2>
              <Link href={toAppHref('/here/art')} className="art-work__band-link">
                {copy.moreByAll.replace('{n}', String(moreBy.length))}
              </Link>
            </div>
            <div className="art-work__row3">
              {moreBy.map((item) => (
                <WorkTile key={item.slug} work={item} untitled={copy.untitled} />
              ))}
            </div>
          </section>
        ) : null}

        {moreOnFloor.length > 0 && work.floor ? (
          <section className="art-work__band">
            <div className="art-work__bandh">
              <h2>
                {outside
                  ? copy.moreOutside
                  : copy.moreOnFloor.replace('{floor}', floorLabel(work.floor, locale))}
              </h2>
              <Link href={toAppHref('/here/art')} className="art-work__band-link">
                {outside ? copy.seeOutside : copy.seeFloor}
              </Link>
            </div>
            <div className="art-work__row3">
              {moreOnFloor.map((item) => (
                <WorkTile key={item.slug} work={item} untitled={copy.untitled} />
              ))}
            </div>
          </section>
        ) : null}

        <div className="art-onward">
          <p>{copy.onward}</p>
          <SweepCta href="/here/art" color="ctx" edge="right">
            {copy.onwardCta}
          </SweepCta>
        </div>
      </div>
    </main>
  )
}
