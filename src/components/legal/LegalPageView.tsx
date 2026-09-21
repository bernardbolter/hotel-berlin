import { getTranslations } from 'next-intl/server'

import { LegalDocumentView } from '@/components/legal/LegalDocument'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNavWithData } from '@/components/layout/SiteNavWithData'
import { Link } from '@/i18n/routing'
import { legalPathname } from '@/lib/legal/canonical'
import { LEGAL_SLUGS, getLegalPage } from '@/lib/legal/documents'
import type { LegalSlug } from '@/lib/legal/types'

type Props = {
  slug: LegalSlug
  locale: string
}

export async function LegalPageView({ slug, locale }: Props) {
  const loc = locale === 'de' ? 'de' : 'en'
  const doc = await getLegalPage(slug, loc)
  const t = await getTranslations('legal')

  const related = LEGAL_SLUGS.filter((item) => item !== slug)

  return (
    <>
      <SiteNavWithData context="outside" />
      <main id="main-content" className="bg-hbb-page">
        <div className="site-shell px-section-sm py-section-y md:px-section-x">
          <article className="mx-auto max-w-3xl">
            <header className="mb-10">
              <h1 className="font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12] text-[#1F1F1F]">
                {doc.title}
              </h1>
              {doc.updated ? (
                <p className="mt-3 font-ui text-ui-sm uppercase tracking-ui-label text-gray-500">
                  {t('updated', { date: doc.updated })}
                </p>
              ) : null}
              {doc.lede && slug !== 'terms' ? (
                <p className="mt-4 font-serif text-serif-sm text-[#2A3540]">{doc.lede}</p>
              ) : null}
            </header>

            <nav aria-label={t('relatedAria')} className="mb-10">
              <ul className="flex flex-wrap gap-x-0 gap-y-1 font-ui text-ui-sm text-gray-500">
                {related.map((item, index) => (
                  <li key={item} className="flex items-center">
                    {index > 0 ? (
                      <span aria-hidden="true" className="px-2.5 text-gray-400">
                        ·
                      </span>
                    ) : null}
                    <Link
                      href={legalPathname(item)}
                      className="text-ctx-accent-text underline-offset-2 hover:underline"
                    >
                      {t(`pages.${item}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <LegalDocumentView blocks={doc.blocks} tocLabel={t('onThisPage')} />
          </article>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
