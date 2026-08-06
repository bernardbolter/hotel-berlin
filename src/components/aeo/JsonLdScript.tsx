import type { FAQPageJsonLd } from '@/lib/aeo-schema/src/builders/faq'
import type { JsonLdGraph } from '@/lib/aeo-schema/src/types'

type Props = {
  graph: JsonLdGraph | FAQPageJsonLd
}

/** Renders a JSON-LD graph. Never hand-write schema in page components — pass builder output here. */
export function JsonLdScript({ graph }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
