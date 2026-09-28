import { legalPageMetadata } from '@/lib/legal/canonical'
import { LegalPageView } from '@/components/legal/LegalPageView'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return legalPageMetadata('terms', locale, 'Terms and conditions for Hotel Berlin, Berlin.')
}

export default async function TermsPage({ params }: Props) {
  const { locale } = await params
  return <LegalPageView slug="terms" locale={locale} />
}
