import type { ComponentProps } from 'react'

import { Link } from '@/i18n/routing'
import type { AppPathnames } from '@/i18n/pathnames'

type AppHref = ComponentProps<typeof Link>['href']

/**
 * Split `pathname#hash` so next-intl can localize the pathname
 * (`/here/events` → `/hier/events`). A raw string with a hash skips the map.
 */
export function toAppHref(href: string): AppHref {
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href as AppHref
  const hashAt = href.indexOf('#')
  const queryAt = href.indexOf('?')
  if (hashAt === -1 && queryAt === -1) return href as AppHref

  const cut = [hashAt, queryAt].filter((n) => n >= 0).sort((a, b) => a - b)[0] ?? -1
  const pathname = (cut === -1 ? href : href.slice(0, cut)) as AppPathnames
  const rest = cut === -1 ? '' : href.slice(cut)
  const hash = rest.includes('#') ? rest.slice(rest.indexOf('#') + 1) : undefined
  const queryString = rest.includes('?')
    ? rest.slice(rest.indexOf('?') + 1).split('#')[0]
    : ''
  const query = queryString
    ? Object.fromEntries(new URLSearchParams(queryString))
    : undefined

  return { pathname, ...(hash ? { hash } : {}), ...(query ? { query } : {}) } as unknown as AppHref
}
