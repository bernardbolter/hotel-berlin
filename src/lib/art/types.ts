/** Place-in-building levels (DB column still `locationInBuilding.floor`). Bottom → top. */
export const ART_FLOORS = [
  'outside',
  'basement',
  'lobby',
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
] as const

export type ArtFloor = (typeof ART_FLOORS)[number]

export type ArtworkType = 'mural' | 'edition' | 'installation'
export type ArtworkVisibility = 'live' | 'hidden'
export type ArtworkSaleStatus = 'available' | 'sold' | 'not-for-sale'
export type ArtworkPermission = 'granted' | 'open' | 'denied'
export type ArtworkArtform =
  | 'mural'
  | 'graffiti'
  | 'print'
  | 'photo'
  | 'painting'
  | 'installation'
  | 'sculpture'

export type FloorFilter =
  | 'all'
  | 'outside'
  | 'lobby'
  | 'floors1to4'
  | 'floors5to10'
  | 'basement'
  | 'exhibition'

export const ART_ARTFORM_OPTIONS: Array<{ value: ArtworkArtform; label: { de: string; en: string } }> =
  [
    { value: 'mural', label: { de: 'Mural', en: 'Mural' } },
    { value: 'graffiti', label: { de: 'Graffiti', en: 'Graffiti' } },
    { value: 'print', label: { de: 'Druck', en: 'Print' } },
    { value: 'photo', label: { de: 'Foto', en: 'Photo' } },
    { value: 'painting', label: { de: 'Gemälde', en: 'Painting' } },
    { value: 'installation', label: { de: 'Installation', en: 'Installation' } },
    { value: 'sculpture', label: { de: 'Skulptur', en: 'Sculpture' } },
  ]

export const ART_PERMISSION_OPTIONS: Array<{
  value: ArtworkPermission
  label: { de: string; en: string }
}> = [
  { value: 'granted', label: { de: 'erteilt', en: 'granted' } },
  { value: 'open', label: { de: 'offen', en: 'open' } },
  { value: 'denied', label: { de: 'abgelehnt', en: 'denied' } },
]

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
  realName?: string | null
  shortBio?: string | null
  website?: string | null
  instagram?: string | null
  wikidataId?: string | null
  nationality?: string | null
  basedIn?: string | null
  medium?: string | null
  sameAs?: string[]
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
  geo: { latitude: number; longitude: number } | null
  year: number | null
  technique: string | null
  dimensions: string | null
  artform: ArtworkArtform | null
  surface: string | null
  subjects: string[]
  permission: ArtworkPermission | null
  creditText: string | null
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
