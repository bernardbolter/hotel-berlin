'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'

import { Link } from '@/i18n/routing'
import { toAppHref } from '@/i18n/toAppHref'
import { locationChip, matchesFloorFilter } from '@/lib/art/floors'
import type { ArtArtistListItem, ArtExhibitionTile, ArtWork, FloorFilter } from '@/lib/art/types'

export type ArtGridCopy = {
  all: string
  outside: string
  lobby: string
  floors1to4: string
  floors5to10: string
  basement: string
  exhibition: string
  untitled: string
  emptyState: string
  locationTbc: string
  filtersAria: string
  worksCount: string
  artistsHeading: string
  workCountOne: string
  workCountMany: string
  onward: string
  onwardCta: string
}

type Props = {
  works: ArtWork[]
  exhibitions: ArtExhibitionTile[]
  artists: ArtArtistListItem[]
  copy: ArtGridCopy
}

const FILTERS: FloorFilter[] = [
  'all',
  'outside',
  'lobby',
  'floors1to4',
  'floors5to10',
  'basement',
  'exhibition',
]

export function ArtGrid({ works, exhibitions, artists, copy }: Props) {
  const [filter, setFilter] = useState<FloorFilter>('all')
  const [artistSlug, setArtistSlug] = useState<string | null>(null)

  const visibleWorks = useMemo(() => {
    return works.filter((work) => {
      if (artistSlug && work.artist.slug !== artistSlug) return false
      if (filter === 'exhibition') return work.inExhibition
      return matchesFloorFilter(work.floor, filter)
    })
  }, [works, filter, artistSlug])

  const chipLabel = (key: FloorFilter) => {
    if (key === 'all') return copy.all.replace('{n}', String(works.length))
    return copy[key]
  }

  return (
    <div className="art-grid-wrap">
      {exhibitions.length > 0 ? (
        <div className="art-shows">
          {exhibitions.map((show) => (
            <Link
              key={show.slug}
              href={toAppHref(show.href)}
              className="art-shows__card"
            >
              {show.image ? (
                <Image
                  src={show.image.src}
                  alt={show.image.alt}
                  fill
                  sizes="(max-width: 700px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : null}
              <span className="art-shows__body">
                <span className="art-shows__chips">
                  <span className="art-grid__where art-grid__where--live">{show.chip}</span>
                  {show.venueName ? <span className="art-shows__venue">{show.venueName}</span> : null}
                </span>
                <span className="art-shows__title">{show.title}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      <div className="art-grid__filters" role="group" aria-label={copy.filtersAria}>
        {FILTERS.map((key) => (
          <button
            key={key}
            type="button"
            className="art-grid__chip"
            aria-pressed={filter === key && !artistSlug}
            onClick={() => {
              setFilter(key)
              setArtistSlug(null)
            }}
          >
            {chipLabel(key)}
          </button>
        ))}
      </div>

      {works.length === 0 ? <p className="art-grid__empty">{copy.emptyState}</p> : null}

      <div className="art-grid" data-count={visibleWorks.length}>
        {visibleWorks.map((work) => {
          const title = work.title.trim() || copy.untitled
          const location = locationChip(work.floor, work.spot, copy.locationTbc)
          return (
            <Link
              key={work.slug}
              href={toAppHref(`/here/art/${work.slug}`)}
              className="art-grid__tile"
            >
              {work.image ? (
                <Image
                  src={work.image.src}
                  alt={work.image.alt}
                  fill
                  sizes="(max-width: 699px) 50vw, (max-width: 899px) 33vw, 25vw"
                  className="object-cover"
                  style={work.image.objectPosition ? { objectPosition: work.image.objectPosition } : undefined}
                />
              ) : null}
              <span className="art-grid__cap">
                <span className="art-grid__where">{location}</span>
                <span className="art-grid__who">{work.artist.name}</span>
                <span className="art-grid__title">{title}</span>
              </span>
            </Link>
          )
        })}
      </div>

      {artists.length > 0 ? (
        <div className="art-artists">
          <h2 className="art-artists__h">{copy.artistsHeading}</h2>
          <ul className="art-artists__list">
            {artists.map((artist) => {
              const countLabel =
                artist.workCount === 1
                  ? copy.workCountOne.replace('{n}', '1')
                  : copy.workCountMany.replace('{n}', String(artist.workCount))
              if (artist.personHref) {
                return (
                  <li key={artist.slug}>
                    <Link href={toAppHref(artist.personHref)} className="art-artists__row">
                      <b>{artist.name}</b>
                      <span>{countLabel}</span>
                    </Link>
                  </li>
                )
              }
              return (
                <li key={artist.slug}>
                  <button
                    type="button"
                    className="art-artists__row"
                    onClick={() => {
                      setArtistSlug(artist.slug)
                      setFilter('all')
                    }}
                  >
                    <b>{artist.name}</b>
                    <span>{countLabel}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      <div className="art-onward">
        <p>{copy.onward}</p>
        <Link href={toAppHref('/happenings')} className="art-onward__cta">
          {copy.onwardCta}
        </Link>
      </div>
    </div>
  )
}
