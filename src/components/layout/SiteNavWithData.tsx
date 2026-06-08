import { getLocale } from 'next-intl/server'

import { getSecondaryNavLinks } from '@/lib/payload/navigation'

import { SiteNav } from './SiteNav'

type Props = {
  context?: 'outside' | 'inside'
}

export async function SiteNavWithData({ context = 'outside' }: Props) {
  const locale = (await getLocale()) as 'de' | 'en'
  const secondaryLinks = await getSecondaryNavLinks(locale)

  return <SiteNav context={context} secondaryLinks={secondaryLinks} />
}
