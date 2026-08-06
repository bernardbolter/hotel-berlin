import { getTranslations } from 'next-intl/server'

import { JsonLdScript } from '@/components/aeo/JsonLdScript'
import { FAQPageView } from '@/components/faqs/FAQPageView'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { buildFAQPageGraph } from '@/lib/aeo-schema/src/index'
import {
  getFaqs,
  GUEST_FAQ_CATEGORIES,
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
    title: `${t('guestPageTitle')} | Hotel Berlin, Berlin`,
    description: t('guestPageDescription'),
    alternates: {
      canonical: `https://hotel-berlin.de/${locale === 'de' ? 'de/hier/faq' : 'en/here/faq'}`,
      languages: {
        de: 'https://hotel-berlin.de/de/hier/faq',
        en: 'https://hotel-berlin.de/en/here/faq',
        'x-default': 'https://hotel-berlin.de/de/hier/faq',
      },
    },
  }
}

export default async function HereFaqPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations('faq')
  const faqs = await getFaqs({ context: 'guest', locale })

  const items = faqs.map((f) => ({
    id: f.slug,
    question: f.question,
    answer: f.answer,
    category: f.category as FaqCategory,
    order: f.order,
  }))

  const presentCategories = GUEST_FAQ_CATEGORIES.filter((cat) =>
    items.some((i) => i.category === cat),
  )

  const categoryOptions = [
    { value: 'all' as const, label: t('allCategories') },
    ...presentCategories.map((value) => ({
      value,
      label: t(CATEGORY_MESSAGE_KEY[value]),
    })),
  ]

  const graph = buildFAQPageGraph(faqs)

  return (
    <>
      <JsonLdScript graph={graph} />
      <SiteNavWithData context="inside" />
      <main id="main-content">
        <FAQPageView
          items={items}
          context="guest"
          heading={t('guestPageTitle')}
          categoryOptions={categoryOptions}
          allLabel={t('allCategories')}
          categoriesHeading={t('categoriesAria')}
        />
      </main>
      <SiteFooter />
    </>
  )
}
