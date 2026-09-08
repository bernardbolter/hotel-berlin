import { SweepCta, type SweepCtaColor } from '@/components/primitives/SweepCta'
import { Link } from '@/i18n/routing'

/**
 * Section heading: serif title, optional right-aligned link.
 * Sections that lead somewhere pass href + cta; self-contained ones omit them.
 */
const HEADING_CLASS =
  'text-left font-serif text-[clamp(2.15rem,3.4vw,3.1rem)] font-normal leading-[1.12] text-[#1F1F1F]'

const underlineColor: Record<'teal' | 'nbhd' | 'ink', string> = {
  teal: 'var(--teal)',
  nbhd: 'var(--nbhd)',
  ink: '#1F1F1F',
}

type Props = {
  id: string
  title: string
  href?: string
  cta?: string
  ctaColor?: SweepCtaColor
  /** sweep = site CTA; underline = hub card-system link (13px, section colour). */
  ctaStyle?: 'sweep' | 'underline'
  underlineTone?: 'teal' | 'nbhd' | 'ink'
}

export function HubSerifHeading({
  id,
  title,
  href,
  cta,
  ctaColor = 'ink',
  ctaStyle = 'sweep',
  underlineTone = 'ink',
}: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h2 id={id} className={HEADING_CLASS}>
        {title}
      </h2>
      {href && cta ? (
        ctaStyle === 'underline' ? (
          <Link
            // @ts-expect-error Hub headings accept string pathnames.
            href={href}
            className="hub-section-link shrink-0"
            style={{ color: underlineColor[underlineTone] }}
          >
            {cta}
          </Link>
        ) : (
          <SweepCta href={href} color={ctaColor} edge="right" className="shrink-0">
            {cta}
          </SweepCta>
        )
      ) : null}
    </div>
  )
}
