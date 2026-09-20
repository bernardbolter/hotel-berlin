import { getTranslations } from 'next-intl/server'

import { EventsAgendaView, agendaCanonicalPath } from '@/components/events/EventsAgendaView'
import { HereSubpage } from '@/components/here/HereSubpage'
import { herePageMetadata } from '@/lib/here/canonical'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ kategorie?: string; category?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'events.agenda' })
  const intro = await getTranslations({ locale, namespace: 'here' })
  const canonical = agendaCanonicalPath(locale === 'de' ? 'de' : 'en', '/here/events')
  const meta = herePageMetadata('/here/events', locale, t('pageTitle'), intro('pages.events.intro'))
  return {
    ...meta,
    alternates: {
      ...meta.alternates,
      canonical,
    },
  }
}

export default async function HereEventsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const query = await searchParams
  const t = await getTranslations('events.agenda')
  const here = await getTranslations('here')
  const loc = locale === 'de' ? 'de' : 'en'
  const filterRaw = loc === 'de' ? query.kategorie : query.category

  return (
    <HereSubpage title={t('pageTitle')} intro={here('pages.events.intro')} backLabel={here('backToHub')}>
      <EventsAgendaView
        locale={locale}
        framing="guest"
        filterRaw={filterRaw}
        pathname="/here/events"
      />
    </HereSubpage>
  )
}
