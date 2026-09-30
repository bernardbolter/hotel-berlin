import type { JsonLdNode, SiteConfig } from '../types'
import { artListUrl, artworkNodeId, hotelNodeId, personNodeId } from '../lib/ids'
import { prune } from '../lib/prune'

export type SchemaArtwork = {
  slug: string
  /** Omit when untitled — VisualArtwork then has no `name`. */
  title?: string | null
  description?: string
  image?: string
  imageCredit?: string | null
  creatorName?: string
  creatorPersonSlug?: string | null
  creatorRealName?: string | null
  creatorSameAs?: string[]
  creatorWikidataId?: string | null
  creatorDescription?: string | null
  artform?: string | null
  artMedium?: string | null
  artworkSurface?: string | null
  keywords?: string[]
  /** When set, used as contentLocation Place instead of the hotel. */
  contentLocationGeo?: { latitude: number; longitude: number } | null
}

function buildCreator(artwork: SchemaArtwork, config: SiteConfig) {
  if (!artwork.creatorName) return undefined

  const sameAs = [...(artwork.creatorSameAs ?? [])]
  const base = artwork.creatorPersonSlug
    ? {
        '@type': 'Person' as const,
        '@id': personNodeId(artwork.creatorPersonSlug, config),
        name: artwork.creatorName,
      }
    : {
        '@type': 'Person' as const,
        '@id': `${artworkNodeId(artwork.slug, config)}#artist-${slugify(artwork.creatorName)}`,
        name: artwork.creatorName,
      }

  return prune({
    ...base,
    alternateName: artwork.creatorRealName || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    identifier: artwork.creatorWikidataId || undefined,
    description: artwork.creatorDescription || undefined,
  })
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

export function buildArtworkNode(artwork: SchemaArtwork, config: SiteConfig): JsonLdNode {
  const title = artwork.title?.trim() || undefined
  const image =
    artwork.image || artwork.imageCredit
      ? prune({
          '@type': 'ImageObject',
          contentUrl: artwork.image,
          creditText: artwork.imageCredit || undefined,
          copyrightNotice: artwork.imageCredit
            ? artwork.imageCredit.startsWith('©')
              ? artwork.imageCredit
              : `© ${artwork.imageCredit}`
            : undefined,
        })
      : undefined

  const contentLocation = artwork.contentLocationGeo
    ? prune({
        '@type': 'Place',
        geo: {
          '@type': 'GeoCoordinates',
          latitude: artwork.contentLocationGeo.latitude,
          longitude: artwork.contentLocationGeo.longitude,
        },
      })
    : { '@id': hotelNodeId(config) }

  return prune({
    '@type': 'VisualArtwork',
    '@id': artworkNodeId(artwork.slug, config),
    name: title,
    description: artwork.description,
    image,
    creator: buildCreator(artwork, config),
    artform: artwork.artform || undefined,
    artMedium: artwork.artMedium || undefined,
    artworkSurface: artwork.artworkSurface || undefined,
    keywords: artwork.keywords?.length ? artwork.keywords.join(', ') : undefined,
    contentLocation,
  })
}

/** Index page: CollectionPage + ItemList of @id references only. */
export function buildArtIndexGraph(
  artworks: SchemaArtwork[],
  config: SiteConfig,
  copy: { name: string; description?: string },
): {
  '@context': 'https://schema.org'
  '@graph': JsonLdNode[]
} {
  const listId = `${artListUrl(config)}#list`
  return {
    '@context': 'https://schema.org',
    '@graph': [
      prune({
        '@type': 'CollectionPage',
        '@id': artListUrl(config),
        name: copy.name,
        description: copy.description,
        mainEntity: { '@id': listId },
      }),
      prune({
        '@type': 'ItemList',
        '@id': listId,
        numberOfItems: artworks.length,
        itemListElement: artworks.map((artwork, index) =>
          prune({
            '@type': 'ListItem',
            position: index + 1,
            item: { '@id': artworkNodeId(artwork.slug, config) },
          }),
        ),
      }),
    ],
  }
}

/** @deprecated Prefer buildArtIndexGraph on the index and buildArtworkNode on work pages. */
export function buildArtPageGraph(artworks: SchemaArtwork[], config: SiteConfig): {
  '@context': 'https://schema.org'
  '@graph': JsonLdNode[]
} {
  return buildArtIndexGraph(artworks, config, { name: 'Kunst im Haus' })
}
