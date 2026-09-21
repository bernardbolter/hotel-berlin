import { legalPageMetadata } from '@/lib/legal/canonical'
import { LegalPageView } from '@/components/legal/LegalPageView'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return legalPageMetadata('privacy', locale, 'Privacy policy for Hotel Berlin, Berlin.')
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params
  return <LegalPageView slug="privacy" locale={locale} />
}
