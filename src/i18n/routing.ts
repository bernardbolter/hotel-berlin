import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

import { pathnames } from './pathnames'

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  localePrefix: 'always',
  localeDetection: false,
  pathnames,
})

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
