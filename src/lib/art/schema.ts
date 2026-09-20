import { lexicalToPlain } from '@/lib/richText/lexicalToPlain'
import { buildArtPageGraph, type SchemaArtwork } from '@/lib/aeo-schema/src/builders/artwork'
import { defaultConfig } from '@/lib/aeo-schema/src/lib/config'

import type { ArtWork } from './types'

export function workToSchemaArtwork(work: ArtWork): SchemaArtwork {
  return {
    slug: work.slug,
    title: work.title || work.artist.name,
    description: lexicalToPlain(work.description) || undefined,
    image: work.image?.src,
    creatorName: work.artist.name,
    creatorPersonSlug: work.artist.person?.published ? work.artist.person.slug : null,
  }
}

export function buildArtJsonLd(works: ArtWork[]) {
  return buildArtPageGraph(works.map(workToSchemaArtwork), defaultConfig)
}
