import { getLocale, getTranslations } from 'next-intl/server'

import { HereHubStrip } from '@/components/here/HereHubStrip'
import type { LightSectionBackground } from '@/components/layout/SectionShell'

type Props = {
  /** Explicit section tint — required so rhythm stays intentional. */
  background: LightSectionBackground
}

/**
 * Homepage Happenings — same strip as /here (`HereHubStrip`).
 * Kept as a thin alias so existing imports keep working.
 */
export async function EventsSection({ background }: Props) {
  const locale = await getLocale()
  const t = await getTranslations('events')

  return (
    <HereHubStrip
      locale={locale}
      background={background}
      framing="prospect"
      heading={{
        id: 'events-heading',
        title: t('label'),
        cta: t('viewAll'),
        href: '/happenings',
        rowAria: t('rowAria'),
      }}
    />
  )
}
