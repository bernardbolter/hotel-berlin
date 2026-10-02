import type { MetadataRoute } from 'next'

import { getWorkSlugs } from '@/lib/art/works'
import { isSoftLaunch } from '@/lib/launch/softLaunch'
import { getRoomSlugs } from '@/lib/payload/rooms'

const ORIGIN = 'https://hotel-berlin.de'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isSoftLaunch()) return []

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${ORIGIN}/de/hier/art`,
      alternates: { languages: { de: `${ORIGIN}/de/hier/art`, en: `${ORIGIN}/en/here/art` } },
    },
    {
      url: `${ORIGIN}/de/zimmer`,
      alternates: {
        languages: { de: `${ORIGIN}/de/zimmer`, en: `${ORIGIN}/en/rooms` },
      },
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

  try {
    const roomSlugs = await getRoomSlugs()
    for (const slug of roomSlugs) {
      entries.push({
        url: `${ORIGIN}/de/zimmer/${slug}`,
        alternates: {
          languages: {
            de: `${ORIGIN}/de/zimmer/${slug}`,
            en: `${ORIGIN}/en/rooms/${slug}`,
          },
        },
      })
    }
  } catch {
    // Rooms unavailable — skip.
  }

  return entries
}
