import { ExternalLink } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { KenBurnsSlider } from '@/components/primitives/KenBurnsSlider'
import { OpenStatusBadge } from '@/components/primitives/OpenStatusBadge'
import { lutzeImages } from '@/lib/data/homepageImages'

import { Link } from '@/i18n/routing'

export async function LutzeSection() {
  const t = await getTranslations('lutze')

  const hours = [
    { term: t('hourLabelBar'), detail: t('hoursBar') },
    { term: t('hourLabelKitchen'), detail: t('hoursKitchen') },
    { term: t('hourLabelVinyl'), detail: t('hoursVinyl') },
    { term: t('hourLabelKttk'), detail: t('hoursKttk') },
  ]

  return (
    <section
      aria-labelledby="lutze-heading"
      className="border-l-[3px] border-hbb-amber bg-hbb-amber-wash"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative min-h-[280px] md:min-h-[420px]">
          <KenBurnsSlider
            images={[...lutzeImages]}
            aria-label={t('galleryAria')}
            interval={5500}
            className="h-full min-h-[280px] md:min-h-[420px]"
          />
        </div>

        <div className="flex flex-col gap-4 px-7 py-7">
          <div className="flex items-center gap-3">
            <span className="font-ui text-[28px] font-medium text-hbb-teal-deep">
              {t('name')}
            </span>
            <span className="rounded-pill border border-hbb-amber px-2 py-0.5 font-ui text-[10px] uppercase tracking-ui-label text-hbb-amber">
              {t('tagline')}
            </span>
          </div>

          <p className="label-tag">{t('descriptor')}</p>

          <h2 id="lutze-heading" className="font-serif text-serif-md font-medium text-hbb-teal-deep">
            {t('heading')}
          </h2>

          <p className="font-serif text-serif-sm text-gray-600">{t('body')}</p>

          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {hours.map(({ term, detail }) => (
              <div key={term} className="flex items-start gap-2">
                <dt className="label-tag">{term}</dt>
                <dd className="font-ui text-ui-sm text-gray-600">{detail}</dd>
              </div>
            ))}
          </dl>

          <OpenStatusBadge />

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://luetze-berlin.de"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t('ctaVisitAria')}
              className="btn-primary flex items-center gap-1.5"
            >
              {t('ctaVisit')}
              <ExternalLink aria-hidden="true" size={12} />
            </a>
            <a href="/book-lutze" className="btn-outline">
              {t('ctaReserve')}
            </a>
            <Link
              href="/here/dining"
              className="border-b border-gray-300 pb-px font-ui text-ui-xs text-gray-400"
            >
              {t('ctaDining')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
