'use client'

import Image from 'next/image'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { RichTextParagraphs } from '@/components/primitives/RichTextParagraphs'
import { Link } from '@/i18n/routing'
import { toAppHref } from '@/i18n/toAppHref'
import { currentHashId } from '@/hooks/useHashOpen'
import { artPanelOrder, gridColumnCount, locationChip, matchesFloorFilter } from '@/lib/art/floors'
import type { ArtExhibitionTile, ArtWork, FloorFilter } from '@/lib/art/types'

export type ArtGridCopy = {
  all: string
  lobby: string
  floors1to4: string
  floors5to10: string
  basement: string
  by: string
  moreBy: string
  untitled: string
  close: string
  emptyState: string
  locationTbc: string
  year: string
  technique: string
  size: string
  filtersAria: string
}

type Props = {
  works: ArtWork[]
  exhibition: ArtExhibitionTile | null
  copy: ArtGridCopy
}

const FILTERS: FloorFilter[] = ['all', 'lobby', 'floors1to4', 'floors5to10', 'basement']

function werkSlug(hash: string): string | null {
  const match = /^werk-(.+)$/.exec(hash)
  return match?.[1] ?? null
}

function artistHref(work: ArtWork): string | null {
  const person = work.artist.person
  if (!person?.published || !person.slug) return null
  return `/you-me-berlin/${person.slug}`
}

export function ArtGrid({ works, exhibition, copy }: Props) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<FloorFilter>('all')
  const [artistSlug, setArtistSlug] = useState<string | null>(null)
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const [columns, setColumns] = useState(2)

  const visibleWorks = useMemo(() => {
    return works.filter((work) => {
      if (!matchesFloorFilter(work.floor, filter)) return false
      if (artistSlug && work.artist.slug !== artistSlug) return false
      return true
    })
  }, [works, filter, artistSlug])

  const tiles: Array<{ kind: 'exhibition' | 'artwork'; slug: string }> = useMemo(() => {
    const list: Array<{ kind: 'exhibition' | 'artwork'; slug: string }> = []
    if (exhibition) list.push({ kind: 'exhibition', slug: exhibition.slug })
    for (const work of visibleWorks) list.push({ kind: 'artwork', slug: work.slug })
    return list
  }, [exhibition, visibleWorks])

  const measure = useCallback(() => {
    const grid = gridRef.current
    if (!grid) return
    setColumns(gridColumnCount(getComputedStyle(grid).gridTemplateColumns))
  }, [])

  useEffect(() => {
    measure()
    const grid = gridRef.current
    if (!grid || typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure)
      return () => window.removeEventListener('resize', measure)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(grid)
    return () => observer.disconnect()
  }, [measure, visibleWorks.length, filter, artistSlug])

  useEffect(() => {
    const apply = () => setOpenSlug(werkSlug(currentHashId()))
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [])

  useEffect(() => {
    if (!openSlug) return
    const panel = document.getElementById(`werk-${openSlug}`)
    const heading = panel?.querySelector<HTMLElement>('h2')
    if (heading) {
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1')
      heading.focus({ preventScroll: true })
    }
  }, [openSlug])

  const setHash = (slug: string | null) => {
    const { pathname, search } = window.location
    if (slug) window.history.replaceState(null, '', `#werk-${slug}`)
    else window.history.replaceState(null, '', `${pathname}${search}`)
    setOpenSlug(slug)
  }

  const toggle = (slug: string) => {
    setHash(openSlug === slug ? null : slug)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !openSlug) return
      const button = document.getElementById(`tile-${openSlug}`)
      setHash(null)
      button?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openSlug])

  const chipLabel = (key: FloorFilter) => {
    if (key === 'all') return copy.all.replace('{n}', String(works.length))
    return copy[key]
  }

  return (
    <div className="art-grid-wrap">
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
              setHash(null)
            }}
          >
            {chipLabel(key)}
          </button>
        ))}
      </div>

      {works.length === 0 ? <p className="art-grid__empty">{copy.emptyState}</p> : null}

      <div ref={gridRef} className="art-grid" data-count={tiles.length}>
        {exhibition ? (
          <Link
            href={toAppHref(exhibition.href)}
            className="art-grid__tile art-grid__tile--exhibition"
            style={{ order: 0 }}
          >
            {exhibition.image ? (
              <Image
                src={exhibition.image.src}
                alt={exhibition.image.alt}
                fill
                sizes="(max-width: 699px) 50vw, (max-width: 899px) 33vw, 25vw"
                className="object-cover"
                style={exhibition.image.objectPosition ? { objectPosition: exhibition.image.objectPosition } : undefined}
              />
            ) : null}
            <span className="art-grid__cap">
              <span className="art-grid__where art-grid__where--live">{exhibition.chip}</span>
              <span className="art-grid__who">{exhibition.title}</span>
            </span>
          </Link>
        ) : null}

        {visibleWorks.map((work) => {
          const tileIndex = tiles.findIndex((tile) => tile.kind === 'artwork' && tile.slug === work.slug)
          const { tile, panel } = artPanelOrder(tileIndex, tiles.length, columns)
          const open = openSlug === work.slug
          const title = work.title.trim() || copy.untitled
          const href = artistHref(work)
          const location = locationChip(work.floor, work.spot, copy.locationTbc)
          const byLabel = copy.by.replace('{artist}', work.artist.name)
          const moreBy = copy.moreBy.replace('{artist}', work.artist.name)

          return (
            <Fragment key={work.slug}>
              <button
                id={`tile-${work.slug}`}
                type="button"
                className={`art-grid__tile${open ? ' is-open' : ''}`}
                style={{ order: tile }}
                aria-expanded={open}
                aria-controls={`panel-${work.slug}`}
                onClick={() => toggle(work.slug)}
              >
                <Image
                  src={work.image!.src}
                  alt={work.image!.alt}
                  fill
                  sizes="(max-width: 699px) 50vw, (max-width: 899px) 33vw, 25vw"
                  className="object-cover"
                  style={work.image?.objectPosition ? { objectPosition: work.image.objectPosition } : undefined}
                />
                <span className="art-grid__cap">
                  <span className="art-grid__where">{location}</span>
                  <span className="art-grid__who">{work.artist.name}</span>
                </span>
              </button>
              <section
                id={`werk-${work.slug}`}
                className="art-grid__panel"
                style={{ order: panel }}
                hidden={open ? undefined : ('until-found' as unknown as boolean)}
                aria-hidden={!open}
              >
                <div id={`panel-${work.slug}`} className="art-grid__panel-inner">
                  <div className="art-grid__panel-photo">
                    <Image
                      src={work.image!.src}
                      alt={work.image!.alt}
                      width={1200}
                      height={1500}
                      sizes="(max-width: 700px) 100vw, 50vw"
                      className="art-grid__panel-img"
                      style={work.image?.objectPosition ? { objectPosition: work.image.objectPosition } : undefined}
                    />
                  </div>
                  <div className="art-grid__panel-copy">
                    <p className="art-grid__panel-loc">{location}</p>
                    <h2 className="art-grid__panel-title">{title}</h2>
                    {href ? (
                      <Link href={toAppHref(href)} className="art-grid__artist-link">
                        {byLabel} →
                      </Link>
                    ) : (
                      <p className="art-grid__artist-plain">{byLabel}</p>
                    )}
                    {work.description ? (
                      <RichTextParagraphs
                        value={work.description}
                        paragraphClassName="font-serif text-serif-sm leading-relaxed text-[#2A3540]"
                      />
                    ) : null}
                    {work.year || work.technique || work.dimensions ? (
                    <dl className="art-grid__facts">
                      {work.year ? (
                        <div>
                          <dt>{copy.year}</dt>
                          <dd>{work.year}</dd>
                        </div>
                      ) : null}
                      {work.technique ? (
                        <div>
                          <dt>{copy.technique}</dt>
                          <dd>{work.technique}</dd>
                        </div>
                      ) : null}
                      {work.dimensions ? (
                        <div>
                          <dt>{copy.size}</dt>
                          <dd>{work.dimensions}</dd>
                        </div>
                      ) : null}
                    </dl>
                    ) : null}
                    <button
                      type="button"
                      className="art-grid__more-by"
                      onClick={() => {
                        setArtistSlug(work.artist.slug)
                        setFilter('all')
                        setHash(null)
                      }}
                    >
                      {moreBy}
                    </button>
                    <button type="button" className="art-grid__close" onClick={() => toggle(work.slug)}>
                      {copy.close}
                    </button>
                  </div>
                </div>
              </section>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
