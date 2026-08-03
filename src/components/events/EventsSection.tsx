import { getTranslations } from 'next-intl/server'

import { SectionHeading } from '@/components/primitives/SectionHeading'
import { eventsTeaser } from '@/lib/data/eventsTeaser'

import { EventsRow } from './EventsRow'

/**
 * Homepage Happenings / events scaffold — horizontal card row.
 * Full-page layout will use EventsMasonry later.
 */
export async function EventsSection() {
  const t = await getTranslations('events')

  const items = eventsTeaser.map((event) => ({
    title: t(`cards.${event.id}.title`),
    meta: t(`cards.${event.id}.meta`),
    imageSrc: event.imageSrc,
    imageAlt: t(`cards.${event.id}.imageAlt`),
    href: event.href,
    external: event.external,
  }))

  return (
    <section
      aria-labelledby="events-heading"
      className="bg-hbb-page px-section-sm py-section-y md:px-section-x"
    >
      <SectionHeading
        id="events-heading"
        label={t('label')}
        title={t('title')}
        className="mb-8"
      />
      <EventsRow items={items} ariaLabel={t('rowAria')} />
    </section>
  )
}
