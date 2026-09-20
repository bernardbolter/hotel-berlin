import type { JsonLdNode, SiteConfig } from '../types'
import { artworkNodeId, hotelNodeId, personNodeId } from '../lib/ids'
import { prune } from '../lib/prune'

export type SchemaArtwork = {
  slug: string
  title: string
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

  return prune({
    '@type': 'VisualArtwork',
    '@id': artworkNodeId(artwork.slug, config),
    name: artwork.title,
    description: artwork.description,
    image: artwork.image,
    creator,
    contentLocation: { '@id': hotelNodeId(config) },
  })
}

export function buildArtPageGraph(artworks: SchemaArtwork[], config: SiteConfig): {
  '@context': 'https://schema.org'
  '@graph': JsonLdNode[]
} {
  return {
    '@context': 'https://schema.org',
    '@graph': artworks.map((artwork) => buildArtworkNode(artwork, config)),
  }
}
