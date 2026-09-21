import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { ScaffoldPageView } from '@/components/scaffolds/ScaffoldPageView'
import { scaffoldPageMetadata } from '@/lib/scaffolds/canonical'
import type { ScaffoldId } from '@/lib/scaffolds/catalog'

type Props = {
  params: Promise<{ locale: string }>
}

export function createScaffoldPage(id: ScaffoldId) {
  return {
    generateMetadata: async ({ params }: Props): Promise<Metadata> => {
      const { locale } = await params
      const t = await getTranslations({ locale, namespace: 'scaffolds' })
      return scaffoldPageMetadata(
        id,
        locale,
        t(`pages.${id}.title`),
        t(`pages.${id}.intro`),
      )
    },
    Page: async function ScaffoldRoute({ params }: Props) {
      const { locale } = await params
      return <ScaffoldPageView id={id} locale={locale} />
    },
  }
}
