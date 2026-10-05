import { permanentRedirect } from 'next/navigation'

type Props = {
  params: Promise<{ locale: string }>
}

/**
 * Legacy `/faqs` pathname alias — permanent redirect to `/faq`.
 * Pathname key kept in pathnames.ts; DE slug for /faq unchanged (Bernard undecided).
 */
export default async function FaqsAliasRedirect({ params }: Props) {
  const { locale } = await params
  permanentRedirect(`/${locale}/faq`)
}
