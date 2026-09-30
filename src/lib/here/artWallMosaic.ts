import { pickWorksWithFloorVariety } from '@/lib/art/floors'
import type { ArtFloor } from '@/lib/art/types'

export type ArtWallChipVariant = 'now' | 'soon' | 'permanent' | 'place'

export type ArtWallMosaicSpan = { cols: 1 | 2; rows: 1 | 2 }

export type ArtWallMosaicTile = {
  kind: 'exhibition' | 'work' | 'more'
  href: string
  title: string
  subtitle: string
  chip: string
  chipVariant: ArtWallChipVariant
  galleryChip: string | null
  image: { src: string; alt: string } | null
  span: ArtWallMosaicSpan
}

export type ExhibitionMosaicInput = {
  id: string | number
  title: string
  slug: string
  href: string
  runType: 'dated' | 'permanent'
  chip: string
  chipVariant: 'now' | 'soon' | 'permanent'
  galleryName: string | null
  subtitle: string
  image: { src: string; alt: string } | null
}

export type WorkMosaicInput = {
  id: string | number
  slug: string
  href: string
  title: string
  where: string
  floor: ArtFloor | null
  image: { src: string; alt: string } | null
}

export type ArtWallMosaic = {
  tiles: ArtWallMosaicTile[]
  /** 4 for A–E; 3 for sparse F (two works + Alle Werke). */
  columns: 3 | 4
}

const SMALL: ArtWallMosaicSpan = { cols: 1, rows: 1 }
const WIDE: ArtWallMosaicSpan = { cols: 2, rows: 1 }
const BIG: ArtWallMosaicSpan = { cols: 2, rows: 2 }

function workTile(work: WorkMosaicInput, span: ArtWallMosaicSpan): ArtWallMosaicTile {
  return {
    kind: 'work',
    href: work.href,
    title: work.title,
    subtitle: '',
    chip: work.where,
    chipVariant: 'place',
    galleryChip: null,
    image: work.image,
    span,
  }
}

function exhibitionTile(
  show: ExhibitionMosaicInput,
  span: ArtWallMosaicSpan,
): ArtWallMosaicTile {
  return {
    kind: 'exhibition',
    href: show.href,
    title: show.title,
    subtitle: show.subtitle,
    chip: show.chip,
    chipVariant: show.chipVariant,
    galleryChip: show.galleryName,
    image: show.image,
    span,
  }
}

function moreTile(label: string): ArtWallMosaicTile {
  return {
    kind: 'more',
    href: '/here/art',
    title: label,
    subtitle: '',
    chip: '',
    chipVariant: 'place',
    galleryChip: null,
    image: null,
    span: SMALL,
  }
}

function pickWorks(works: WorkMosaicInput[], limit: number): WorkMosaicInput[] {
  // Only works with images reach the mosaic (caller should already filter; belt + braces).
  const withImage = works.filter((w) => Boolean(w.image?.src))
  return pickWorksWithFloorVariety(
    withImage.map((work) => ({ work, floor: work.floor })),
    limit,
  ).map((row) => row.work)
}

/**
 * Pure mosaic builder for `/hier` Kunst im Haus (A3).
 * States A–G from `doc/art/HotelBerlin_ArtSection_States.html`.
 * Returns null when there is nothing to show (state G).
 */
export function buildArtWallMosaic(args: {
  /** Current shows, already sorted: dated soonest-first, permanent last. Cap applied here. */
  current: ExhibitionMosaicInput[]
  /** First upcoming within 30 days, or empty. */
  upcoming: ExhibitionMosaicInput[]
  /** Live works with images, pinned then newest. */
  works: WorkMosaicInput[]
  moreLabel: string
}): ArtWallMosaic | null {
  const current = args.current.slice(0, 2)
  const upcoming = args.upcoming[0] ?? null
  const works = args.works.filter((w) => Boolean(w.image?.src))
  const hasWorks = works.length > 0

  if (current.length === 0 && !upcoming && !hasWorks) return null

  const tiles: ArtWallMosaicTile[] = []
  const pushWorks = (n: number) => {
    for (const work of pickWorks(works, n)) tiles.push(workTile(work, SMALL))
  }
  const pushMore = () => {
    if (hasWorks) tiles.push(moreTile(args.moreLabel))
  }

  // A — two current: two wide + three works + Alle Werke
  if (current.length >= 2) {
    tiles.push(exhibitionTile(current[0]!, WIDE))
    tiles.push(exhibitionTile(current[1]!, WIDE))
    pushWorks(3)
    pushMore()
    return { tiles, columns: 4 }
  }

  // B / C — one current (± announced small)
  if (current.length === 1) {
    tiles.push(exhibitionTile(current[0]!, BIG))
    if (upcoming) {
      tiles.push(exhibitionTile(upcoming, SMALL))
      pushWorks(2)
    } else {
      pushWorks(3)
    }
    pushMore()
    return { tiles, columns: 4 }
  }

  // D — only announced
  if (upcoming) {
    tiles.push(exhibitionTile(upcoming, BIG))
    pushWorks(3)
    pushMore()
    return { tiles, columns: 4 }
  }

  // F — sparse works only (≤2): equal small tiles, 3-col, no big
  if (works.length <= 2) {
    for (const work of pickWorks(works, works.length)) tiles.push(workTile(work, SMALL))
    pushMore()
    return { tiles, columns: 3 }
  }

  // E — works only: lead large, three small, Alle Werke
  const picked = pickWorks(works, 4)
  const [lead, ...rest] = picked
  if (lead) tiles.push(workTile(lead, BIG))
  for (const work of rest.slice(0, 3)) tiles.push(workTile(work, SMALL))
  pushMore()
  return { tiles, columns: 4 }
}
