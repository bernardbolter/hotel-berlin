import type { MetadataRoute } from 'next'

import { getWorkSlugs } from '@/lib/art/works'
import { isSoftLaunch } from '@/lib/launch/softLaunch'

const ORIGIN = 'https://hotel-berlin.de'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isSoftLaunch()) return []

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${ORIGIN}/de/hier/art`,
      alternates: { languages: { de: `${ORIGIN}/de/hier/art`, en: `${ORIGIN}/en/here/art` } },
    },
  ]

  try {
    const slugs = await getWorkSlugs()
    for (const slug of slugs) {
      entries.push({
        url: `${ORIGIN}/de/hier/art/${slug}`,
        alternates: {
          languages: {
            de: `${ORIGIN}/de/hier/art/${slug}`,
            en: `${ORIGIN}/en/here/art/${slug}`,
          },
        },
      })
    }
  } catch {
    // Empty DB / cold start — index entry alone is fine.
  }

  return entries
}
