import type { Meeting, MeetingDocument } from '@/payload-types'

import { getPayloadClient } from './client'

const FALLBACK_MEETINGS_EN: Meeting = {
  id: 0,
  heroKicker: 'Award-winning business hotel in Berlin',
  heroHeadline: 'We take care of your business',
  heroIntro:
    'If you\'re looking for superlatives, then you\'ve landed at the right place! But we\'re actually very modest about being voted "Top 1 Independent Meeting Hotel in Europe" and our "BREEAM" & "Green Key" certificates. Organizing the best events and conferences — with first-class catering, great Berlin meeting rooms and state-of-the-art technology — comes easy to us. Which is why the team at our business hotel in Berlin always puts in extra effort to make sure that your event is a splendid success!',
  heroContactLabel: 'Contact us:',
  heroSlides: [],
  contactPhone: '+49 30 2605 2602',
  contactEmail: 'conference@hotel-berlin.de',
  eventTypesHeading: 'Event formats',
  eventTypes: [],
  facilities: [
    {
      label: 'Light flooded rooms',
      description: 'All our rooms are light flooded (except room Berlin-Berlin).',
      lucideIcon: 'Sun',
    },
    {
      label: 'Air-conditioned',
      description: 'All meeting rooms are air-conditioned.',
      lucideIcon: 'Wind',
    },
    {
      label: 'Adjustable light',
      description: 'Adjustable light in all meeting rooms.',
      lucideIcon: 'Lightbulb',
    },
    {
      label: 'Meeting rooms can be darkened',
      description: 'Mostly all meeting rooms can be darkened.',
      lucideIcon: 'Moon',
    },
    {
      label: 'State-of-the-art technical equipment',
      description:
        'State-of-the-art audio, video and lighting technology, CAT-7, multi-touch displays & projectors with 3 × 20,000 lumens.',
      lucideIcon: 'Monitor',
    },
    {
      label: 'Professional technical partner',
      description:
        'Kuchem Konferenz Technik is our competent and reliable partner for conference, interpreting and event technology.',
      lucideIcon: 'Headset',
    },
    {
      label: 'Spacious foyers',
      description:
        'Spacious foyers provide generous space for networking sessions and are ideal for coffee breaks.',
      lucideIcon: 'Columns2',
    },
    {
      label: 'Electronic room signage',
      description: 'Customizable electronic room signage with branding opportunities.',
      lucideIcon: 'Tablet',
    },
    {
      label: 'Combinable meeting rooms',
      description: 'Combinable meeting rooms for customized events.',
      lucideIcon: 'Combine',
    },
    {
      label: 'Multiple branding options',
      description:
        'At the centre of any successful event there’s always a story — your story! We offer various options for effective and peerless event branding to make sure that your story is unforgettable.',
      lucideIcon: 'Sparkles',
    },
  ],
  closingHeadline: 'Ready to plan your next meeting?',
  closingCtaLabel: 'Request a quote',
  updatedAt: '',
  createdAt: '',
}

const FALLBACK_MEETINGS_DE: Meeting = {
  ...FALLBACK_MEETINGS_EN,
  heroKicker: '',
  heroHeadline: 'Wir kümmern uns um Ihr Business',
  heroIntro:
    'Auf der Suche nach Superlativen sind Sie bei uns in Berlins Mitte angekommen! Aber wir tragen Titel wie „Top 1 Independent Meeting Hotel in Europa“ oder die Nachhaltigkeitszertifikate „BREEAM“ & „Green Key“ mit hauptstädtischem Understatement. Denn die besten Events und Konferenzen auszurichten, – mit erstklassigem Catering, tollen Räumen, hypermoderner Technik und Top-Anbindung – ist für uns easy. Deshalb legen wir zuverlässig immer noch was drauf, um Ihre Veranstaltung wirklich ganz und gar zu Ihrem Erfolg zu machen.',
  heroContactLabel: 'Kontaktieren Sie uns:',
  eventTypesHeading: 'Event-Formate',
  facilities: [
    {
      label: 'Lichtdurchfluteter Raum',
      description: 'All unsere Konferenzräume mit Tageslicht (ausgenommen Berlin-Berlin).',
      lucideIcon: 'Sun',
    },
    {
      label: 'Klimatisiert',
      description: 'Alle Veranstaltungsräume sind klimatisiert.',
      lucideIcon: 'Wind',
    },
    {
      label: 'Regelbares Licht',
      description: 'Regelbares Licht in allen Veranstaltungsräumen.',
      lucideIcon: 'Lightbulb',
    },
    {
      label: 'Veranstaltungsraum abdunkelbar',
      description: 'Nahezu alle Veranstaltungsräume sind abdunkelbar.',
      lucideIcon: 'Moon',
    },
    {
      label: 'Modernste technische Ausstattung',
      description:
        'Modernste Audio-, Video- und Lichttechnik, CAT-7, Multi-Touch-Displays & Projektoren mit 3 × 20.000 Lumen.',
      lucideIcon: 'Monitor',
    },
    {
      label: 'Professioneller technischer Partner',
      description:
        'Kuchem Konferenz Technik ist unser kompetenter und zuverlässiger Partner für Konferenz-, Dolmetscher- und Veranstaltungstechnik.',
      lucideIcon: 'Headset',
    },
    {
      label: 'Großzügige Foyers',
      description:
        'Großzügige Foyers bieten ausreichend Platz für Networking und sind ideal für Kaffeepausen.',
      lucideIcon: 'Columns2',
    },
    {
      label: 'Digitale Raumausschilderung',
      description: 'Anpassbare digitale Raumbeschilderung mit Branding-Möglichkeiten.',
      lucideIcon: 'Tablet',
    },
    {
      label: 'Kombinierbare Veranstaltungsräume',
      description: 'Kombinierbare Veranstaltungsräume für maßgeschneiderte Events.',
      lucideIcon: 'Combine',
    },
    {
      label: 'Vielfältige Möglichkeiten des eigenen Brandings',
      description:
        'Im Mittelpunkt jeder erfolgreichen Veranstaltung steht immer eine Geschichte — Ihre Geschichte! Wir bieten verschiedene Möglichkeiten für effektives und unvergleichliches Event-Branding, damit Ihre Geschichte unvergesslich wird.',
      lucideIcon: 'Sparkles',
    },
  ],
  closingHeadline: 'Bereit für dein nächstes Meeting?',
  closingCtaLabel: 'Anfrage senden',
}

export async function getMeetingsGlobal(
  locale: 'de' | 'en' = 'en',
): Promise<Meeting> {
  const fallback = locale === 'de' ? FALLBACK_MEETINGS_DE : FALLBACK_MEETINGS_EN
  try {
    const payload = await getPayloadClient()
    const doc = await payload.findGlobal({
      slug: 'meetings',
      locale,
      // Avoid DE leaking onto EN when a localized field is empty.
      fallbackLocale: false,
      depth: 2,
    })
    return {
      ...fallback,
      ...doc,
      heroHeadline: doc.heroHeadline || fallback.heroHeadline,
      heroIntro: doc.heroIntro || fallback.heroIntro,
      contactPhone: doc.contactPhone || fallback.contactPhone,
      contactEmail: doc.contactEmail || fallback.contactEmail,
      closingHeadline: doc.closingHeadline || fallback.closingHeadline,
      closingCtaLabel: doc.closingCtaLabel || fallback.closingCtaLabel,
      eventTypesHeading: doc.eventTypesHeading || fallback.eventTypesHeading,
      eventTypes: doc.eventTypes?.length ? doc.eventTypes : fallback.eventTypes,
      facilities: doc.facilities?.length ? doc.facilities : fallback.facilities,
    }
  } catch {
    return fallback
  }
}

export async function getMeetingDocuments(
  locale: 'de' | 'en' = 'en',
): Promise<MeetingDocument[]> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'meeting-documents',
      locale,
      depth: 1,
      sort: 'sortOrder',
      limit: 100,
    })
    return docs
  } catch {
    return []
  }
}

export async function getRelatedFloorPlan(
  area: string,
  locale: 'de' | 'en' = 'en',
): Promise<MeetingDocument | null> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'meeting-documents',
      locale,
      depth: 1,
      where: {
        and: [
          { category: { equals: 'floor-plan' } },
          { area: { equals: area } },
        ],
      },
      limit: 1,
    })
    return docs[0] ?? null
  } catch {
    return null
  }
}

export async function getMeetingDocumentByKey(
  key: string,
  locale: 'de' | 'en' = 'en',
): Promise<MeetingDocument | null> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'meeting-documents',
      locale,
      depth: 1,
      where: { key: { equals: key } },
      limit: 1,
    })
    return docs[0] ?? null
  } catch {
    return null
  }
}

export async function getMeetingDocumentByPageRole(
  pageRole: 'hybrid-teaser' | 'banquet-teaser',
  locale: 'de' | 'en' = 'en',
): Promise<MeetingDocument | null> {
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'meeting-documents',
      locale,
      depth: 1,
      where: { pageRole: { equals: pageRole } },
      sort: 'sortOrder',
      limit: 1,
    })
    return docs[0] ?? null
  } catch {
    return null
  }
}

export async function getHybridDocument(
  locale: 'de' | 'en' = 'en',
): Promise<MeetingDocument | null> {
  const byRole = await getMeetingDocumentByPageRole('hybrid-teaser', locale)
  if (byRole) return byRole
  const byKey = await getMeetingDocumentByKey('hybrid', locale)
  if (byKey) return byKey
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'meeting-documents',
      locale,
      depth: 1,
      where: { category: { equals: 'hybrid' } },
      sort: 'sortOrder',
      limit: 1,
    })
    return docs[0] ?? null
  } catch {
    return null
  }
}
