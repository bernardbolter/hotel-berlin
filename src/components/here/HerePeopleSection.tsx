import { getTranslations } from 'next-intl/server'

import { HubSerifHeading } from '@/components/here/HubSerifHeading'
import { PersonCard } from '@/components/here/PersonCard'
import { getHubPeople } from '@/lib/here/getHubPeople'

type Props = {
  locale: string
}

/**
 * Four person cards above the map. Renders nothing when no published people
 * exist — does not invent hosts.
 */
export async function HerePeopleSection({ locale }: Props) {
  const t = await getTranslations('here.peopleRow')
  const people = await getHubPeople(locale, {
    walk: (minutes) => t('walk', { minutes }),
    room: (n) => t('room', { n }),
    cta: t('profileCta'),
    roleFallback: t('roleFallback'),
  })

  if (people.length === 0) return null

  return (
    <section
      aria-labelledby="here-people-heading"
      className="site-shell px-section-sm py-section-y md:px-section-x"
    >
      <HubSerifHeading
        id="here-people-heading"
        title={t('title')}
        href="/you-me-berlin"
        cta={t('cta')}
        ctaStyle="underline"
        underlineTone="nbhd"
      />
      <ul role="list" aria-label={t('rowAria')} className="hub-row">
        {people.map((person) => (
          <li key={person.name} className="min-w-0">
            <PersonCard {...person} />
          </li>
        ))}
      </ul>
    </section>
  )
}
