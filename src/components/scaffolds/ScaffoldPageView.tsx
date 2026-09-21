import { getTranslations } from 'next-intl/server'

import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { Link } from '@/i18n/routing'
import { SCAFFOLD_PATHNAME, SCAFFOLD_RELATED, type ScaffoldId } from '@/lib/scaffolds/catalog'
import { getHotel } from '@/lib/payload/hotel'

type Props = {
  id: ScaffoldId
  locale: string
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`
}

async function ContactFacts({ locale }: { locale: 'de' | 'en' }) {
  const t = await getTranslations('scaffolds')
  const hotel = await getHotel(locale).catch(() => null)

  const street = hotel?.address?.streetAddress?.trim() || 'Lützowplatz 17'
  const postal = hotel?.address?.postalCode?.trim() || '10785'
  const city = hotel?.address?.addressLocality?.trim() || 'Berlin'
  const country =
    hotel?.address?.addressCountry?.trim() || (locale === 'de' ? 'Deutschland' : 'Germany')
  const phone = hotel?.telephone?.trim() || '+49 30 26050'
  const email = hotel?.email?.trim() || 'info@hotel-berlin.de'
  const map = hotel?.directionsUrl?.trim() || hotel?.hasMap?.trim() || null

  return (
    <address className="mt-10 not-italic">
      <p className="font-serif text-serif-sm text-[#2A3540]">
        {street}
        <br />
        {postal} {city}
        <br />
        {country}
      </p>
      <p className="mt-4 font-ui text-ui-sm">
        <a
          href={telHref(phone)}
          className="text-ctx-accent-text underline-offset-2 hover:underline"
        >
          {phone}
        </a>
      </p>
      <p className="mt-1 font-ui text-ui-sm">
        <a
          href={`mailto:${email}`}
          className="text-ctx-accent-text underline-offset-2 hover:underline"
        >
          {email}
        </a>
      </p>
      {map ? (
        <p className="mt-4 font-ui text-ui-sm">
          <a
            href={map}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ctx-accent-text underline-offset-2 hover:underline"
          >
            {t('directions')}
          </a>
        </p>
      ) : null}
    </address>
  )
}

export async function ScaffoldPageView({ id, locale }: Props) {
  const loc = locale === 'de' ? 'de' : 'en'
  const t = await getTranslations('scaffolds')
  const related = SCAFFOLD_RELATED[id]

  return (
    <>
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page">
        <div className="site-shell px-section-sm py-section-y md:px-section-x">
          <article className="mx-auto max-w-3xl">
            <header className="mb-10">
              <p className="mb-3 font-ui text-ui-sm uppercase tracking-ui-label text-gray-500">
                {t('kicker')}
              </p>
              <h1 className="font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12] text-[#1F1F1F]">
                {t(`pages.${id}.title`)}
              </h1>
              <p className="mt-4 font-serif text-serif-sm text-[#2A3540]">{t(`pages.${id}.intro`)}</p>
            </header>

            {id === 'contact' ? <ContactFacts locale={loc} /> : null}

            {related.length > 0 ? (
              <nav aria-label={t('relatedAria')} className={id === 'contact' ? 'mt-10' : undefined}>
                <ul className="flex flex-wrap gap-x-0 gap-y-1 font-ui text-ui-sm text-gray-500">
                  {related.map((item, index) => {
                    const href =
                      item.type === 'scaffold' ? SCAFFOLD_PATHNAME[item.id] : item.href
                    const label =
                      item.type === 'scaffold'
                        ? t(`pages.${item.id}.title`)
                        : t(`existing.${item.label}`)

                    return (
                      <li key={`${item.type}-${href}`} className="flex items-center">
                        {index > 0 ? (
                          <span aria-hidden="true" className="px-2.5 text-gray-400">
                            ·
                          </span>
                        ) : null}
                        <Link
                          href={href}
                          className="text-ctx-accent-text underline-offset-2 hover:underline"
                        >
                          {label}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>
            ) : null}
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
