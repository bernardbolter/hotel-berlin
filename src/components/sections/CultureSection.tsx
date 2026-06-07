import { getTranslations } from 'next-intl/server'

import { ContentCard } from '@/components/primitives/ContentCard'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { cultureCardConfig } from '@/lib/data/cultureCards'

export async function CultureSection() {
  const t = await getTranslations('culture')

  return (
    <section
      aria-labelledby="culture-heading"
      className="bg-hbb-page px-section-sm py-section-y md:px-section-x"
    >
      <SectionHeading
        id="culture-heading"
        label={t('label')}
        title={t('title')}
        className="mb-8"
      />
      <ul
        role="list"
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        aria-label={t('gridAria')}
      >
        {(await Promise.all(
          cultureCardConfig.map(async (card) => (
            <li key={card.id}>
              <ContentCard
              badge={t(`cards.${card.id}.badge`)}
              badgeColor={card.badgeColor}
              title={t(`cards.${card.id}.title`)}
              subtitle={t(`cards.${card.id}.subtitle`)}
              body={t(`cards.${card.id}.body`)}
              meta={t(`cards.${card.id}.meta`)}
              ctaLabel={t(`cards.${card.id}.cta`)}
              ctaHref={card.ctaHref}
              ctaExternal={card.ctaExternal}
              image={card.image}
              imageAlt={t(`cards.${card.id}.imageAlt`)}
              />
            </li>
          )),
        ))}
      </ul>
    </section>
  )
}
