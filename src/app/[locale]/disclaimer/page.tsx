import { legalPageMetadata } from '@/lib/legal/canonical'
import { LegalPageView } from '@/components/legal/LegalPageView'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  return legalPageMetadata(
    'disclaimer',
    locale,
    'Copyright and disclaimer for Hotel Berlin, Berlin.',
  )
}

export default async function DisclaimerPage({ params }: Props) {
  const { locale } = await params
  return <LegalPageView slug="disclaimer" locale={locale} />
}
