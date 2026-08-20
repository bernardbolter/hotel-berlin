import { getTranslations } from 'next-intl/server'

import { HereFactGroup } from '@/components/here/HereFactGroup'
import { HereSubpage } from '@/components/here/HereSubpage'
import { LineCta } from '@/components/primitives/LineCta'
import { herePageMetadata } from '@/lib/here/canonical'
import { getEvents } from '@/lib/payload/events'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'here' })
  return herePageMetadata(
    '/here/events',
    locale,
    t('pages.events.title'),
    t('pages.events.intro'),
  )
}

function formatEventDate(iso: string, locale: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Berlin',
  }).format(d)
}

export default async function HereEventsPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('here')
  const loc = locale === 'de' ? 'de' : 'en'
  const events = await getEvents({ limit: 12, locale: loc }).catch(() => [])

  return (
    <HereSubpage
      kicker={t('inProgress')}
      title={t('pages.events.title')}
      intro={t('pages.events.intro')}
      backLabel={t('backToHub')}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <HereFactGroup
          title={t('pages.events.kttkTitle')}
          items={[
            { label: t('pages.events.when'), body: t('pages.events.kttkWhen') },
            { label: t('pages.events.where'), body: t('pages.events.kttkWhere') },
            { label: t('pages.events.price'), body: t('pages.events.kttkPrice') },
          ]}
        />
        <HereFactGroup
          title={t('pages.events.openPlayTitle')}
          items={[
            { label: t('pages.events.when'), body: t('pages.events.openPlayWhen') },
            { label: t('pages.events.where'), body: t('pages.events.openPlayWhere') },
            { body: t('pages.events.openPlayNote') },
          ]}
        />
      </div>

      {events.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 font-ui text-ui-md font-medium text-hbb-black">
            {t('pages.events.upcoming')}
          </h2>
          <ul className="divide-y divide-gray-200 border-y border-gray-200">
            {events.map((event) => (
              <li key={event.id} className="py-3">
                <p className="font-ui text-ui-md text-hbb-black">{event.name}</p>
                <p className="font-ui text-ui-sm text-gray-500">
                  {formatEventDate(event.startDate, loc)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-6">
        <LineCta href="/here/art" className="text-ui-sm">
          {t('pages.events.artCta')}
        </LineCta>
      </div>
    </HereSubpage>
  )
}
