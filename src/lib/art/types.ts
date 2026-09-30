export const ART_FLOORS = [
  'B2',
  'B1',
  'EG',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'Dach',
] as const

export type ArtFloor = (typeof ART_FLOORS)[number]
export type ArtworkType = 'mural' | 'edition' | 'installation'
export type ArtworkVisibility = 'live' | 'hidden'
export type ArtworkSaleStatus = 'available' | 'sold' | 'not-for-sale'
export type FloorFilter = 'all' | 'lobby' | 'floors1to4' | 'floors5to10' | 'basement' | 'exhibition'

export type ArtImage = {
  src: string
  alt: string
  objectPosition?: string
}

export type ArtPersonLink = {
  slug: string
  name: string
  published: boolean
}

export type ArtArtist = {
  name: string
  slug: string
  person: ArtPersonLink | null
}

export type ArtWork = {
  id: number
  slug: string
  title: string
  artworkType: ArtworkType
  visibility: ArtworkVisibility
  status: ArtworkSaleStatus | null
  artist: ArtArtist
  floor: ArtFloor | null
  spot: string | null
  year: number | null
  technique: string | null
  dimensions: string | null
  description: unknown
  image: ArtImage | null
  contextImage: ArtImage | null
  detailImages: ArtImage[]
  pinned: boolean
  order: string
  /** True when linked from any exhibition.artworks join. */
  inExhibition: boolean
}

export type ArtExhibitionTile = {
  slug: string
  title: string
  href: string
  chip: string
  venueName: string | null
  image: ArtImage | null
  runType: 'dated' | 'permanent'
}

export type ArtArtistListItem = {
  name: string
  slug: string
  workCount: number
  personHref: string | null
}

export type ArtPageData = {
  works: ArtWork[]
  exhibitions: ArtExhibitionTile[]
  artists: ArtArtistListItem[]
}

export type ArtWorkExhibitionBand = {
  slug: string
  title: string
  href: string
  current: boolean
  line: string
}
