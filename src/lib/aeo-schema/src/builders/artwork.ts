import type { JsonLdNode, SiteConfig } from '../types'
import { artListUrl, artworkNodeId, hotelNodeId, personNodeId } from '../lib/ids'
import { prune } from '../lib/prune'

export type SchemaArtwork = {
  slug: string
  /** Omit when untitled — VisualArtwork then has no `name`. */
  title?: string | null
  description?: string
  image?: string
  creatorName?: string
  creatorPersonSlug?: string | null
}

export function buildArtworkNode(artwork: SchemaArtwork, config: SiteConfig): JsonLdNode {
  const creator = artwork.creatorPersonSlug
    ? {
        '@type': 'Person',
        '@id': personNodeId(artwork.creatorPersonSlug, config),
        name: artwork.creatorName,
      }
    : artwork.creatorName
      ? { '@type': 'Person', name: artwork.creatorName }
      : undefined

  const title = artwork.title?.trim() || undefined

  return prune({
    '@type': 'VisualArtwork',
    '@id': artworkNodeId(artwork.slug, config),
    name: title,
    description: artwork.description,
    image: artwork.image,
    creator,
    contentLocation: { '@id': hotelNodeId(config) },
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
