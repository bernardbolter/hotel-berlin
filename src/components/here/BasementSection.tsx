import { getTranslations } from 'next-intl/server'

import { SectionDivider } from '@/components/here/SectionDivider'
import { VenueCompactCard } from '@/components/cards/VenueCompactCard'

export async function BasementSection() {
  const t = await getTranslations('here')

  return (
    <>
      <SectionDivider label={t('inTheBasement')} />
      <VenueCompactCard
        className="here-half h-full border border-[#B87A2E]"
        density="detailed"
        badge={t('basement.kttk.badge')}
        badgeVariant="schedule"
        title={t('basement.kttk.title')}
        lines={[t('basement.kttk.line1'), t('basement.kttk.line2')]}
        href="/here/events"
        categoryToken="amber"
      />
      <VenueCompactCard
        className="here-half h-full border border-[#E0E0E0]"
        density="detailed"
        badge={t('basement.wallride.badge')}
        badgeVariant="static"
        title={t('basement.wallride.title')}
        lines={[t('basement.wallride.line1'), t('basement.wallride.line2')]}
        href="/here/wallride"
        categoryToken="neutral"
      />
      <article className="here-full border border-dashed border-[#bbb] bg-[repeating-linear-gradient(45deg,#fafafa,#fafafa_10px,#f0f0f0_10px,#f0f0f0_20px)] p-4">
        <h3 className="font-ui text-ui-md font-medium text-gray-400">
          {t('basement.fingerboard.title')}
        </h3>
        <p className="mt-1 font-ui text-ui-sm text-gray-400">
          {t('basement.fingerboard.body')}
        </p>
      </article>
    </>
  )
}
