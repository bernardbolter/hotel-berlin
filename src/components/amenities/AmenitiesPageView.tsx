import { getTranslations } from 'next-intl/server'

import { AmenityListRow } from '@/components/amenities/AmenityListRow'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { HashOpen } from '@/components/primitives/HashOpen'
import { Link } from '@/i18n/routing'
import { amenityToCard, getAmenities } from '@/lib/amenities/resolve'
import { getHotel, guestStayFromHotel } from '@/lib/payload/hotel'

type Props = {
  locale: string
}

const RELATED = [
  { href: '/accessibility' as const, labelKey: 'relatedAccessibility' },
  { href: '/rooms' as const, labelKey: 'relatedRooms' },
  { href: '/here/faq' as const, labelKey: 'relatedFaq' },
] as const

export async function AmenitiesPageView({ locale }: Props) {
  const loc = locale === 'de' ? 'de' : 'en'
  const page = await getTranslations('amenities.page')
  const inHouse = await getTranslations('here.inHouse')
  const list = await getTranslations('amenities.list')
  const copy = {
    specWhen: inHouse('specWhen'),
    specPrice: inHouse('specPrice'),
    specWhat: inHouse('specWhat'),
    locationTbc: inHouse('locationTbc'),
    labels: {
      closed: inHouse('closed'),
      onRequest: inHouse('onRequest'),
    },
  }
  const rowCopy = {
    specWhen: inHouse('specWhen'),
    specPrice: inHouse('specPrice'),
    morePrefix: list('morePrefix'),
    faqHeading: list('faqHeading'),
    pendingText: list('pendingText'),
    locationLabel: list('locationLabel'),
    accessLabel: list('accessLabel'),
  }

  const [{ facilities, services }, hotel] = await Promise.all([
    getAmenities({ context: 'list', locale: loc }),
    getHotel().catch(() => null),
  ])
  const stay = guestStayFromHotel(hotel, loc)
  const checkin = hotel?.checkinTime?.trim() || '15:00'
  const checkout = stay.checkout.value
  const checkInOutLine = list('checkInOut', { checkin, checkout })

  const toRow = (doc: (typeof facilities)[number]) => {
    const card = amenityToCard(doc, loc, copy)
    return (
      <AmenityListRow
        key={card.key}
        id={card.slug}
        title={card.title}
        location={card.eyebrow}
        icon={card.icon}
        image={card.image}
        pending={card.pending}
        specs={card.specs}
        summary={card.summary}
        notice={card.notice}
        details={card.details}
        access={card.access}
        hoursNote={card.hoursNote}
        pageHref={card.pageHref}
        relatedFaqs={card.relatedFaqs}
        copy={rowCopy}
      />
    )
  }

  return (
    <>
      <HashOpen />
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page">
        <div className="site-shell px-section-sm py-section-y md:px-section-x">
          <header className="mb-10 max-w-3xl">
            <h1 className="font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12] text-[#1F1F1F]">
              {page('title')}
            </h1>
            <p className="mt-4 font-serif text-serif-sm text-[#2A3540]">{page('intro')}</p>
          </header>

          <section aria-labelledby="amenities-facilities-heading" className="mb-10">
            <p id="amenities-facilities-heading" className="amenity-list-group">
              {list('facilities')} · {facilities.length}
            </p>
            <div className="amenity-list">{facilities.map(toRow)}</div>
          </section>

          <section aria-labelledby="amenities-services-heading" className="mb-10">
            <p id="amenities-services-heading" className="amenity-list-group">
              {list('services')} · {services.length}
            </p>
            <p className="amenity-list-checkin">{checkInOutLine}</p>
            {services.length > 0 ? <div className="amenity-list">{services.map(toRow)}</div> : null}
          </section>

          <nav aria-label={list('relatedAria')} className="mt-12 max-w-3xl">
            <ul className="flex flex-wrap gap-x-0 gap-y-1 font-ui text-ui-sm text-gray-500">
              {RELATED.map((item, index) => (
                <li key={item.href} className="flex items-center">
                  {index > 0 ? (
                    <span aria-hidden="true" className="px-2.5 text-gray-400">
                      ·
                    </span>
                  ) : null}
                  <Link href={item.href} className="text-ctx-accent-text underline-offset-2 hover:underline">
                    {list(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
