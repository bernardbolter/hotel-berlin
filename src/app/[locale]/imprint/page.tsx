import { legalPageMetadata } from '@/lib/legal/canonical'
import { LegalPageView } from '@/components/legal/LegalPageView'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return legalPageMetadata('imprint', locale, 'Legal notice for Hotel Berlin, Berlin.')
}

export default async function ImprintPage({ params }: Props) {
  const { locale } = await params
  return <LegalPageView slug="imprint" locale={locale} />
}
