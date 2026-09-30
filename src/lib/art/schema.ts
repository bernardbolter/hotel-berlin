import { buildArtIndexGraph, buildArtworkNode, type SchemaArtwork } from '@/lib/aeo-schema/src/builders/artwork'
import { defaultConfig } from '@/lib/aeo-schema/src/lib/config'
import { isUntitledTitle } from '@/lib/art/floors'
import { ART_ARTFORM_OPTIONS } from '@/lib/art/types'
import { workPlainDescription } from '@/lib/art/works'
import type { ArtWork } from '@/lib/art/types'

function artformLabel(value: ArtWork['artform'], locale: 'de' | 'en' = 'de'): string | null {
  if (!value) return null
  const opt = ART_ARTFORM_OPTIONS.find((o) => o.value === value)
  return opt ? opt.label[locale] : value
}

function creatorSameAs(work: ArtWork): string[] {
  const urls = [...(work.artist.sameAs ?? [])]
  const ig = work.artist.instagram?.trim()
  if (ig) {
    const handle = ig.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/$/, '')
    if (handle) urls.push(`https://instagram.com/${handle}`)
  }
  const web = work.artist.website?.trim()
  if (web) urls.push(web.startsWith('http') ? web : `https://${web}`)
  return [...new Set(urls)]
}

export function workToSchemaArtwork(work: ArtWork, locale: 'de' | 'en' = 'de'): SchemaArtwork {
  const untitled = isUntitledTitle(work.title)
  return {
    slug: work.slug,
    title: untitled ? null : work.title,
    description: workPlainDescription(work),
    image: work.image?.src,
    imageCredit: work.creditText,
    creatorName: work.artist.name,
    creatorPersonSlug: work.artist.person?.published ? work.artist.person.slug : null,
    creatorRealName: work.artist.realName,
    creatorSameAs: creatorSameAs(work),
    creatorWikidataId: work.artist.wikidataId,
    creatorDescription: work.artist.shortBio,
    artform: artformLabel(work.artform, locale),
    artMedium: work.technique,
    artworkSurface: work.surface,
    keywords: work.subjects,
    contentLocationGeo:
      work.floor === 'outside' && work.geo
        ? work.geo
        : null,
  }
}

export function buildArtIndexJsonLd(
  works: ArtWork[],
  copy: { name: string; description?: string },
) {
  return buildArtIndexGraph(
    works.map((w) => workToSchemaArtwork(w)),
    defaultConfig,
    copy,
  )
}

export function buildArtWorkJsonLd(work: ArtWork, locale: 'de' | 'en' = 'de') {
  return {
    '@context': 'https://schema.org' as const,
    '@graph': [buildArtworkNode(workToSchemaArtwork(work, locale), defaultConfig)],
  }
}
