import type { SecondaryNavLink } from '@/lib/nav/types'

import { getPayloadClient } from './client'

type InsideLinkRow = {
  id?: string | number | null
  page?: number | { id?: number; slug?: string | null; title?: string | null } | null
}

const fallbackInsideLinks: Record<'de' | 'en', SecondaryNavLink[]> = {
  en: [
    { id: 'fallback-events', label: "What's on", href: '/here/events' },
    { id: 'fallback-getting-around', label: 'Getting around', href: '/here/getting-around' },
    { id: 'fallback-local-tips', label: 'Local tips', href: '/here/explore' },
    { id: 'fallback-gallery', label: 'Gallery', href: '/here/gallery' },
    {
      id: 'fallback-wallride',
      label: 'Wallride',
      href: '#',
      comingSoon: true,
    },
  ],
  de: [
    { id: 'fallback-events', label: 'Was läuft', href: '/here/events' },
    { id: 'fallback-getting-around', label: 'Orientierung', href: '/here/getting-around' },
    { id: 'fallback-local-tips', label: 'Lokale Tipps', href: '/here/explore' },
    { id: 'fallback-gallery', label: 'Galerie', href: '/here/gallery' },
    {
      id: 'fallback-wallride',
      label: 'Wallride',
      href: '#',
      comingSoon: true,
    },
  ],
}

function isWallrideSlug(slug: string): boolean {
  return /wallride/i.test(slug)
}

function toInsideNavLink(row: InsideLinkRow): SecondaryNavLink | null {
  const page = row.page
  if (!page || typeof page !== 'object' || !page.slug) return null

  const label = page.title?.trim()
  if (!label) return null

  const slug = page.slug.replace(/^\//, '')
  const wallride = isWallrideSlug(slug)

  return {
    id: String(row.id ?? page.id),
    label,
    href: wallride ? '#' : `/${slug}`,
    external: false,
    comingSoon: wallride || undefined,
  }
}

/** Secondary nav row links — sourced from Inside Navigation global `secondaryLinks`. */
export async function getSecondaryNavLinks(locale: 'de' | 'en'): Promise<SecondaryNavLink[]> {
  try {
    const payload = await getPayloadClient()
    const nav = await payload.findGlobal({
      slug: 'navigation',
      depth: 2,
      locale,
    })

    const resolved = (nav.secondaryLinks ?? [])
      .map((row) => toInsideNavLink(row))
      .filter((link): link is SecondaryNavLink => link != null)

    if (resolved.length > 0) {
      return resolved
    }
  } catch (error) {
    console.error('[getSecondaryNavLinks] Failed to load navigation global:', error)
  }

  return fallbackInsideLinks[locale]
}
