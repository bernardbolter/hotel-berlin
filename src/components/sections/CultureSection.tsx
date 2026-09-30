import { getTranslations } from 'next-intl/server'

import { ContentCard } from '@/components/primitives/ContentCard'
import { SectionHeading } from '@/components/primitives/SectionHeading'

/** Culture cards without stock photographs (F5). Image slots stay empty. */
const cultureCardConfig = [
  { id: 'fkkb', badgeColor: 'teal' as const, ctaHref: '/here/art', ctaExternal: false },
  { id: 'kttk', badgeColor: 'amber' as const, ctaHref: '/happenings', ctaExternal: false },
  { id: 'lutze', badgeColor: 'green' as const, ctaHref: '/here/dining', ctaExternal: false },
  { id: 'ymb', badgeColor: 'purple' as const, ctaHref: '/you-me-berlin', ctaExternal: false },
]

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
        {cultureCardConfig.map((card) => (
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
              image={undefined}
              imageAlt=""
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
