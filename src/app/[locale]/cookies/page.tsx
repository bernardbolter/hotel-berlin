import { legalPageMetadata } from '@/lib/legal/canonical'
import { LegalPageView } from '@/components/legal/LegalPageView'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return legalPageMetadata('cookies', locale, 'Cookie information for Hotel Berlin, Berlin.')
}

export default async function CookiesPage({ params }: Props) {
  const { locale } = await params
  return <LegalPageView slug="cookies" locale={locale} />
}
