import { getTranslations } from 'next-intl/server'

import { HubSerifHeading } from '@/components/here/HubSerifHeading'
import { TipCard } from '@/components/here/TipCard'
import { getHubTips } from '@/lib/here/getHubTips'
import type { PlaceCategory } from '@/lib/neighbourhood/constants'

type Props = {
  locale: string
}

/**
 * Four curated tips on /here. Deduped by endorser; room pill only when
 * the hotel has confirmed the number. Full set + map live on /here/explore.
 */
export async function HereTipsSection({ locale }: Props) {
  const t = await getTranslations('here.peopleRow')
  const tCat = await getTranslations('neighbourhood.categories')
  const tips = await getHubTips(locale, {
    walk: (minutes) => t('walk', { minutes }),
    room: (n) => t('room', { n }),
    placeholder: t('placeholder'),
    noEndorser: t('noEndorser'),
    roleFallback: t('roleFallback'),
    categoryLabel: (category: PlaceCategory) => tCat(category),
    roles: {
      'iris-berndt': t('roles.iris-berndt'),
      'christiane-fritsch-weith': t('roles.christiane-fritsch-weith'),
      'jennifer-oeser': t('roles.jennifer-oeser'),
      'kristiane-kegelmann': t('roles.kristiane-kegelmann'),
      'gita-kurdpoor': t('roles.gita-kurdpoor'),
      'gita-kudpoor': t('roles.gita-kurdpoor'),
      'katja-morkel': t('roles.katja-morkel'),
    },
  })

  if (tips.length === 0) return null

  return (
    <section
      aria-labelledby="here-people-heading"
      className="site-shell px-section-sm py-section-y md:px-section-x"
    >
      <HubSerifHeading
        id="here-people-heading"
        title={t('title')}
        href="/here/explore"
        cta={t('cta')}
        ctaColor="ctx"
      />
      <ul role="list" aria-label={t('rowAria')} className="hub-row">
        {tips.map((tip) => (
          <li key={tip.slug} className="min-w-0">
            <TipCard {...tip} />
          </li>
        ))}
      </ul>
    </section>
  )
}
