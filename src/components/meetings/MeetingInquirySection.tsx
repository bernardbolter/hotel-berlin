'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

import { MeetingInquiryForm } from '@/components/meetings/MeetingInquiryForm'
import { MEETING_INQUIRY_ANCHOR } from '@/lib/meetings/meetingPage'

type RoomOption = { id: number; slug: string; name: string }
type EventOption = { value: string; label: string }

type Props = {
  locale: 'de' | 'en'
  eventTypeOptions: EventOption[]
  roomOptions: RoomOption[]
  preselectedRoomSlug?: string
  /** Standalone request page uses h1; embedded sections use h2. */
  headingLevel?: 'h1' | 'h2'
  contactPhone?: string | null
  contactEmail?: string | null
  className?: string
}

/**
 * Meeting inquiry block — used on overview, room detail, and /request.
 * Anchor id is stable (`anfrage`) so CTAs can scroll with #anfrage.
 */
export function MeetingInquirySection({
  locale,
  eventTypeOptions,
  roomOptions,
  preselectedRoomSlug,
  headingLevel = 'h2',
  contactPhone,
  contactEmail,
  className = '',
}: Props) {
  const t = useTranslations('meetingsPage.request')
  const Heading = headingLevel

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash.replace(/^#/, '') !== MEETING_INQUIRY_ANCHOR) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = document.getElementById(MEETING_INQUIRY_ANCHOR)
    if (!el) return

    // Wait a tick for layout/images so scroll position is accurate.
    const id = window.setTimeout(() => {
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    }, 50)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <section
      id={MEETING_INQUIRY_ANCHOR}
      aria-labelledby="meeting-inquiry-heading"
      className={`scroll-mt-28 bg-[var(--teal-light)] ${className}`}
    >
      <div className="mx-auto max-w-6xl px-section-sm py-section-y md:px-section-x">
        <div className="grid gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
          <div className="md:sticky md:top-28 md:self-start">
            <p className="font-ui text-[10.5px] font-bold uppercase tracking-[0.14em] text-hbb-teal">
              {t('kicker')}
            </p>
            <Heading
              id="meeting-inquiry-heading"
              className="mt-2 font-ui text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-[1.15] text-hbb-black"
            >
              {t('title')}
            </Heading>
            <p className="mt-3 font-ui text-ui-md font-medium text-hbb-black">{t('subtitle')}</p>
            <p className="mt-4 max-w-md font-serif text-serif-md text-[var(--body-text)]">
              {t('intro')}
            </p>

            {(contactPhone || contactEmail) && (
              <p className="mt-6 flex flex-col gap-1 font-ui text-ui-sm text-[var(--dim)] sm:block">
                {contactPhone ? (
                  <a
                    href={`tel:${contactPhone.replace(/\s/g, '')}`}
                    className="text-hbb-teal underline-offset-2 hover:underline"
                  >
                    {contactPhone}
                  </a>
                ) : null}
                {contactPhone && contactEmail ? (
                  <span className="hidden sm:inline"> · </span>
                ) : null}
                {contactEmail ? (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-hbb-teal underline-offset-2 hover:underline"
                  >
                    {contactEmail}
                  </a>
                ) : null}
              </p>
            )}
          </div>

          <div className="border-t border-[var(--rule)] pt-10 md:border-t-0 md:border-l md:pt-0 md:pl-12 lg:pl-16">
            <MeetingInquiryForm
              locale={locale}
              eventTypeOptions={eventTypeOptions}
              roomOptions={roomOptions}
              preselectedRoomSlug={preselectedRoomSlug}
              embedded={headingLevel === 'h2'}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
