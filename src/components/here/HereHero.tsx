import Image from 'next/image'

import { HeroClock } from '@/components/here/HeroClock'
import {
  berlinTimeOfDay,
  formatBerlinDayLabel,
} from '@/lib/here/greeting'
import {
  relativeTimeKey,
  resolveEventHeroOverride,
  resolveHereHeroSubline,
} from '@/lib/here/hero'
import { HERE_IMAGES } from '@/lib/here/images'
import { getBerlinNow } from '@/lib/venue-time'
import { getTranslations } from 'next-intl/server'

type Props = {
  locale: string
  eventSlug?: string
}

/**
 * Guest-hub hero — courtyard image, clock, day label, greeting, two-line event subline.
 */
export async function HereHero({ locale, eventSlug }: Props) {
  const t = await getTranslations('here')
  const tr = await getTranslations('relativeTime')
  const now = getBerlinNow()
  const slot = berlinTimeOfDay(now)
  const dayLabel = formatBerlinDayLabel(now, locale)

  const eventOverride = await resolveEventHeroOverride(eventSlug)
  const live = eventOverride ? null : await resolveHereHeroSubline()

  const greeting = t(
    slot === 'morning'
      ? 'greeting.morning'
      : slot === 'afternoon'
        ? 'greeting.afternoon'
        : 'greeting.evening',
  )

  let line1: string | null = null
  let line2: string | null = null

  if (eventOverride) {
    line1 = eventOverride.name
    line2 = eventOverride.shortDescription
  } else if (live?.kind === 'thursday') {
    line1 = t('heroFallback.thursdayLine1')
    line2 = t('heroFallback.thursdayLine2')
  } else if (live?.kind === 'live') {
    if (live.relativeTime) {
      const { key, values } = relativeTimeKey(live.relativeTime)
      line1 = `${live.line1} ${tr(key, values ?? {})}`
    } else {
      line1 = live.line1
    }
    line2 = live.line2
  }

  const image = HERE_IMAGES.hero

  return (
    <header className="relative flex min-h-[120px] flex-col justify-end overflow-hidden text-white md:h-[280px] md:min-h-0">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-black/10"
        aria-hidden="true"
      />
      <div className="absolute top-4 right-4 z-10 md:top-5 md:right-6">
        <HeroClock ariaLabel={t('clockAria')} />
      </div>
      <div className="relative z-10 px-4 py-5 md:px-6 md:py-7">
        <p className="mb-1.5 font-ui text-[11px] uppercase tracking-[0.12em] text-[#e2e2e2]">
          {dayLabel}
        </p>
        <h1 className="font-ui text-[1.5rem] font-medium leading-tight md:text-[1.875rem]">
          {greeting}
        </h1>
        {line1 ? (
          <p className="mt-1.5 font-ui text-[14px] text-[#eee]">{line1}</p>
        ) : null}
        {line2 ? (
          <p className="mt-1 font-ui text-[13px] text-[#cfcfcf]">{line2}</p>
        ) : null}
        <p className="mt-2.5 font-ui text-[12px] text-[#c9c9c9]">{t('locationLine')}</p>
      </div>
    </header>
  )
}
