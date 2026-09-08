import { getTranslations } from 'next-intl/server'

import { SectionDivider } from '@/components/here/SectionDivider'
import { EditorialBand } from '@/components/primitives/EditorialBand'
import { HERE_IMAGES } from '@/lib/here/images'

export async function BasementSection() {
  const t = await getTranslations('here')

  return (
    <section aria-label={t('inTheBasement')}>
      <SectionDivider label={t('inTheBasement')} />
      <div className="flex flex-col gap-10">
        <EditorialBand
          ratio="2:1"
          id="here-kttk-heading"
          heading={t('basement.kttk.title')}
          meta={t('basement.kttk.badge')}
          body={`${t('basement.kttk.line1')} · ${t('basement.kttk.line2')}`}
          image={HERE_IMAGES.kttk}
          cta={{ href: '/here/events', label: t('basement.kttk.cta') }}
        />
        <EditorialBand
          ratio="1:2"
          id="here-wallride-heading"
          heading={t('basement.wallride.title')}
          meta={t('basement.wallride.badge')}
          body={`${t('basement.wallride.line1')} · ${t('basement.wallride.line2')}`}
          image={HERE_IMAGES.wallride}
          placeholder
          placeholderLabel={t('imagePlaceholder')}
          cta={{ href: '/here/wallride', label: t('art.floors.wallride.cta') }}
        />
        <article className="border border-dashed border-[#bbb] bg-[repeating-linear-gradient(45deg,#fafafa,#fafafa_10px,#f0f0f0_10px,#f0f0f0_20px)] p-4">
          <h3 className="font-ui text-ui-md font-medium text-gray-400">
            {t('basement.fingerboard.title')}
          </h3>
          <p className="mt-1 font-ui text-ui-sm text-gray-400">
            {t('basement.fingerboard.body')}
          </p>
        </article>
      </div>
    </section>
  )
}
