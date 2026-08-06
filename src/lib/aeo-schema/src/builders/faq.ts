import type { Faq } from '@/payload-types'

export type FAQPageJsonLd = {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: {
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }[]
}

/**
 * FAQPage JSON-LD from the exact FAQ list rendered on screen.
 * Pass mini-block results for mini blocks; the full context set for /faq pages.
 * Never pass a larger set than what the page shows.
 */
export function buildFAQPageGraph(faqs: Pick<Faq, 'question' | 'answer'>[]): FAQPageJsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  }
}
