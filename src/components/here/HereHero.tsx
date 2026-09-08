import { HereHeroLayout } from '@/components/here/HereHeroLayout'
import { type HeroSlide } from '@/components/home/heroSlides'
import {
  berlinTimeOfDay,
  formatBerlinDayLabel,
} from '@/lib/here/greeting'
import { getHeroSubline } from '@/lib/here/getHeroSubline'
import { resolveEventHeroOverride } from '@/lib/here/hero'
import { getHeroSlides } from '@/lib/payload/homepage'
import { getGuestStayInfo } from '@/lib/payload/hotel'
import { getBerlinNow } from '@/lib/venue-time'
import { relativeTimeMessage } from '@/lib/venue-time/relativeTimeMessage'
import { getTranslations } from 'next-intl/server'

type Props = {
  locale: string
  eventSlug?: string
}

/**
 * Guest-hub hero — same `.home-hero` 1fr 2fr shell as home.
 * Greeting currently from i18n day-slot copy: `hereHero` Payload global
 * was specced in the original /here brief and is still not in the schema.
 */
export async function HereHero({ locale, eventSlug }: Props) {
  const t = await getTranslations('here')
  const tRel = await getTranslations('relativeTime')
  const now = getBerlinNow()
  const slot = berlinTimeOfDay(now)
  const dayLabel = formatBerlinDayLabel(now, locale)
  const loc = locale === 'de' ? 'de' : 'en'

  const [eventOverride, subline, stay] = await Promise.all([
    resolveEventHeroOverride(eventSlug),
    getHeroSubline({
      now,
      locale: loc,
      skipLive: Boolean(eventSlug),
      translateRelative: (state) => {
        const rel = relativeTimeMessage(state)
        return rel.values != null ? tRel(rel.key, rel.values) : tRel(rel.key)
      },
    }),
    getGuestStayInfo(loc),
  ])

  const greeting = eventOverride
    ? eventOverride.name
    : t(
        slot === 'morning'
          ? 'greeting.morning'
          : slot === 'afternoon'
            ? 'greeting.afternoon'
            : 'greeting.evening',
      )

  let photoSlides: HeroSlide[] = []
  if (eventOverride?.image) {
    photoSlides = [
      {
        src: eventOverride.image.src,
        alt: eventOverride.image.alt,
        captionEN: eventOverride.name,
        captionDE: eventOverride.name,
      },
    ]
  } else if (!eventOverride) {
    photoSlides = await getHeroSlides('here')
    // /here-tagged slides are optional in CMS; reuse the home gallery so the
    // 2/3 photo half is never an empty slab. Photography choice is still open.
    if (photoSlides.length === 0) {
      photoSlides = await getHeroSlides('homepage')
    }
  }

  return (
    <HereHeroLayout
      slides={photoSlides}
      stay={stay}
      copy={{
        dayLabel,
        greeting,
        subline1: subline.type === 'none' ? null : subline.line1,
        subline2: subline.type === 'none' ? null : subline.line2,
        wifiLabel: t('stay.wifi'),
        checkoutLabel: t('stay.checkout'),
        breakfastLabel: t('stay.breakfast'),
        parkingLabel: t('stay.parking'),
        luggageLabel: t('stay.luggage'),
        stayCta: t('heroStayCta'),
        clockAria: t('clockAria'),
        galleryAria: t('galleryAria'),
        wifiPasswordAria: t('heroWifiPasswordAria'),
        guestCareKicker: t('help.guestCare.kicker'),
        guestCareTitle: t('help.guestCare.title'),
        guestCareBody: t('help.guestCare.body'),
        guestCareExtension: t('help.guestCare.extension').trim() || null,
      }}
    />
  )
}
