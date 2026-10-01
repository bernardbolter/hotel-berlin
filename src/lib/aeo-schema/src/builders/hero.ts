import type { JsonLdNode, SiteConfig } from '../types'
import { venueNodeId } from '../lib/ids'
import { prune } from '../lib/prune'

export type SchemaHeroSlide = {
  /** Absolute hero-size image URL */
  contentUrl: string
  /** Derived caption or alt */
  name?: string | null
  /** Longer description; falls back to alt */
  description?: string | null
  altText?: string | null
  keywords?: string | null
  creditText?: string | null
  inLanguage: string
  /** Venue slug when set — referenced as Place @id */
  venueSlug?: string | null
  representativeOfPage?: boolean
}

export function buildHeroImageObject(
  slide: SchemaHeroSlide,
  config: SiteConfig,
): JsonLdNode {
  const description =
    slide.description?.trim() || slide.altText?.trim() || undefined
  const keywords = slide.keywords?.trim() || undefined
  const credit = slide.creditText?.trim() || undefined

  return prune({
    '@type': 'ImageObject',
    contentUrl: slide.contentUrl,
    url: slide.contentUrl,
    name: slide.name?.trim() || description || undefined,
    description,
    keywords,
    creditText: credit,
    inLanguage: slide.inLanguage,
    representativeOfPage: slide.representativeOfPage || undefined,
    contentLocation: slide.venueSlug
      ? { '@id': venueNodeId(config, slide.venueSlug) }
      : undefined,
  })
}

/**
 * WebPage node with hero ImageObjects attached as `image` (array).
 * Follows the brief: attach on the page's WebPage rather than loose top-level nodes.
 */
export function buildHeroWebPageGraph(
  page: {
    url: string
    name: string
    description?: string
    inLanguage: string
  },
  slides: SchemaHeroSlide[],
  config: SiteConfig,
): {
  '@context': 'https://schema.org'
  '@graph': JsonLdNode[]
} {
  const images = slides.map((slide, index) =>
    buildHeroImageObject(
      { ...slide, representativeOfPage: index === 0 ? true : undefined },
      config,
    ),
  )

  return {
    '@context': 'https://schema.org',
    '@graph': [
      prune({
        '@type': 'WebPage',
        '@id': page.url,
        url: page.url,
        name: page.name,
        description: page.description,
        inLanguage: page.inLanguage,
        image: images.length === 1 ? images[0] : images.length > 1 ? images : undefined,
        isPartOf: { '@id': `${config.baseUrl}/#website` },
      }),
    ],
  }
}
