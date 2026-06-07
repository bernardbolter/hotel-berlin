import { ExternalLink } from 'lucide-react'
import { KenBurnsSlider } from '@/components/primitives/KenBurnsSlider'
import { OpenStatusBadge } from '@/components/primitives/OpenStatusBadge'
import { lutzeImages } from '@/lib/data/homepageImages'

import { Link } from '@/i18n/routing'

export function LutzeSection() {
  return (
    <section
      aria-labelledby="lutze-heading"
      className="border-l-[3px] border-hbb-amber bg-hbb-amber-wash"
    >
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative min-h-[280px] md:min-h-[420px]">
          <KenBurnsSlider
            images={[...lutzeImages]}
            aria-label="Lütze restaurant and bar at Hotel Berlin, Berlin"
            interval={5500}
            className="h-full min-h-[280px] md:min-h-[420px]"
          />
        </div>

        <div className="flex flex-col gap-4 px-7 py-7">
          <div className="flex items-center gap-3">
            <span className="font-ui text-[28px] font-medium text-hbb-teal-deep">Lütze</span>
            <span className="rounded-pill border border-hbb-amber px-2 py-0.5 font-ui text-[10px] uppercase tracking-ui-label text-hbb-amber">
              For all good rebels
            </span>
          </div>

          <p className="label-tag">Italian deli-café · Bar · Garden · Lützowplatz 17</p>

          <h2 id="lutze-heading" className="font-serif text-serif-md font-medium text-hbb-teal-deep">
            The place to eat, play, and hang all day.
          </h2>

          <p className="font-serif text-serif-sm text-gray-600">
            In the heart of the hotel — open to guests and Berliners alike. Breakfast from the
            counter. Lunch on the terrace. Cocktails until the city stops. Happy hour isn&apos;t a
            time slot. It&apos;s a state of mind.
          </p>

          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { term: 'Bar', detail: '10:00 – open end, daily' },
              { term: 'Kitchen', detail: '11:30–15:00 & 17:00–22:30' },
              { term: 'Vinyl Nights', detail: 'Every Monday from 18:00' },
              { term: 'KTTK', detail: '13:00–23:00 · 4 tables · €5/30 min' },
            ].map(({ term, detail }) => (
              <div key={term} className="flex items-start gap-2">
                <dt className="label-tag">{term}</dt>
                <dd className="font-ui text-ui-sm text-gray-600">{detail}</dd>
              </div>
            ))}
          </dl>

          <OpenStatusBadge />

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://luetze-berlin.de"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Lütze website (opens in new tab)"
              className="btn-primary flex items-center gap-1.5"
            >
              Visit Lütze
              <ExternalLink aria-hidden="true" size={12} />
            </a>
            <a href="/book-lutze" className="btn-outline">
              Reserve a table
            </a>
            <Link
              href="/here/dining"
              className="border-b border-gray-300 pb-px font-ui text-ui-xs text-gray-400"
            >
              Staying with us? All dining →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
