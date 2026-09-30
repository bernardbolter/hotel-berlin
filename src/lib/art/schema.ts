import { buildArtIndexGraph, buildArtworkNode, type SchemaArtwork } from '@/lib/aeo-schema/src/builders/artwork'
import { defaultConfig } from '@/lib/aeo-schema/src/lib/config'
import { isUntitledTitle } from '@/lib/art/floors'
import { workPlainDescription } from '@/lib/art/works'
import type { ArtWork } from '@/lib/art/types'

export function workToSchemaArtwork(work: ArtWork): SchemaArtwork {
  const untitled = isUntitledTitle(work.title)
  return {
    slug: work.slug,
    title: untitled ? null : work.title,
    description: workPlainDescription(work),
    image: work.image?.src,
    creatorName: work.artist.name,
    creatorPersonSlug: work.artist.person?.published ? work.artist.person.slug : null,
  }
}

export function buildArtIndexJsonLd(
  works: ArtWork[],
  copy: { name: string; description?: string },
) {
  return buildArtIndexGraph(
    works.map(workToSchemaArtwork),
    defaultConfig,
    copy,
  )
}

export function buildArtWorkJsonLd(work: ArtWork) {
  return {
    '@context': 'https://schema.org' as const,
    '@graph': [buildArtworkNode(workToSchemaArtwork(work), defaultConfig)],
  }
}
