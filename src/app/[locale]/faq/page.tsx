import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { FAQPageView } from '@/components/faqs/FAQPageView'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { buildFAQPageGraph } from '@/lib/aeo-schema/src/index'
import {
  getFaqs,
  PROSPECT_FAQ_CATEGORIES,
  type FaqCategory,
} from '@/lib/faqs'

type Props = {
  params: Promise<{ locale: string }>
}

const CATEGORY_MESSAGE_KEY: Record<FaqCategory, string> = {
  'rooms-booking': 'categories.roomsBooking',
  'checkin-checkout': 'categories.checkinCheckout',
  dining: 'categories.dining',
  meetings: 'categories.meetings',
  accessibility: 'categories.accessibility',
  'getting-here': 'categories.gettingHere',
  'pets-parking': 'categories.petsParking',
  general: 'categories.general',
  'wifi-tech': 'categories.wifiTech',
  'guest-services': 'categories.guestServices',
  'neighbourhood-guest': 'categories.neighbourhoodGuest',
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'faq' })

  return {
    title: `${t('pageTitle')} | Hotel Berlin, Berlin`,
    description: t('pageDescription'),
    alternates: {
      canonical: `https://hotel-berlin.de/${locale === 'de' ? 'de/faq' : 'en/faq'}`,
      languages: {
        de: 'https://hotel-berlin.de/de/faq',
        en: 'https://hotel-berlin.de/en/faq',
        'x-default': 'https://hotel-berlin.de/de/faq',
      },
    },
  }
}

export default async function FaqPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('faq')
  const faqs = await getFaqs({ context: 'prospect', locale })

  const items = faqs.map((f) => ({
    id: f.slug,
    question: f.question,
    answer: f.answer,
    category: f.category as FaqCategory,
    order: f.order,
  }))

  const presentCategories = PROSPECT_FAQ_CATEGORIES.filter((cat) =>
    items.some((i) => i.category === cat),
  )

  const categoryOptions = [
    { value: 'all' as const, label: t('allCategories') },
    ...presentCategories.map((value) => ({
      value,
      label: t(CATEGORY_MESSAGE_KEY[value]),
    })),
  ]

  // Schema describes the full unfiltered prospect set (not the active chip view)
  const graph = buildFAQPageGraph(faqs)

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="outside" />
      <main id="main-content">
        <FAQPageView
          items={items}
          context="prospect"
          heading={t('pageTitle')}
          categoryOptions={categoryOptions}
          allLabel={t('allCategories')}
          categoriesHeading={t('categoriesAria')}
        />
      </main>
      <SiteFooter />
    </>
  )
}
