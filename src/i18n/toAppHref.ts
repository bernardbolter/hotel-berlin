import type { ComponentProps } from 'react'

import { Link } from '@/i18n/routing'
import type { AppPathnames } from '@/i18n/pathnames'

type AppHref = ComponentProps<typeof Link>['href']

/**
 * Split `pathname#hash` so next-intl can localize the pathname
 * (`/here/events` → `/hier/events`). A raw string with a hash skips the map.
 */
export function toAppHref(href: string): AppHref {
  const hashAt = href.indexOf('#')
  if (hashAt === -1) return href as AppHref
  if (/^(https?:|mailto:|tel:)/i.test(href)) return href as AppHref

  const pathname = href.slice(0, hashAt)
  const hash = href.slice(hashAt + 1)
  return { pathname: pathname as AppPathnames, hash } as unknown as AppHref
}
