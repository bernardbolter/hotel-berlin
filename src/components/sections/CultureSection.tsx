import { ContentCard } from '@/components/primitives/ContentCard'
import { SectionHeading } from '@/components/primitives/SectionHeading'
import { cultureCards } from '@/lib/data/cultureCards'

export function CultureSection() {
  return (
    <section
      aria-labelledby="culture-heading"
      className="bg-hbb-page px-section-sm py-section-y md:px-section-x"
    >
      <SectionHeading
        id="culture-heading"
        label="Arts & Culture"
        title="The building is the programme"
        className="mb-8"
      />
      <ul
        role="list"
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        aria-label="Arts and culture at Hotel Berlin, Berlin"
      >
        {cultureCards.map((card) => (
          <li key={card.title}>
            <ContentCard {...card} />
          </li>
        ))}
      </ul>
    </section>
  )
}
