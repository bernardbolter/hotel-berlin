import type { ComponentProps } from 'react'

import { Link } from '@/i18n/routing'

type AppHref = ComponentProps<typeof Link>['href']

export type VenueCompactCardProps = {
  density: 'compact' | 'detailed'
  badge: string
  badgeVariant: 'schedule' | 'liveStatus' | 'static'
  /** When `badgeVariant` is `liveStatus` — green open / muted closed */
  liveOpen?: boolean
  title: string
  /** 1 line at compact density, up to 2 at detailed */
  lines: string[]
  href: string
  external?: boolean
  /** amber (KTTK), gold (Lütze), neutral (Wallride), plus a few for homepage teasers */
  categoryToken: string
  className?: string
}

const tokenClass: Record<string, { shell: string; badge: string }> = {
  amber: { shell: 'bg-[#FDF6EE]', badge: 'text-hbb-nav-amber' },
  gold: { shell: 'bg-[#FDF8EE]', badge: 'text-hbb-gold' },
  neutral: { shell: 'bg-gray-50', badge: 'text-gray-500' },
  art: { shell: 'bg-[#F5F2F6]', badge: 'text-hbb-purple' },
  sport: { shell: 'bg-[#F0F5F3]', badge: 'text-hbb-green' },
  neighbourhood: { shell: 'bg-[#F7F5EC]', badge: 'text-hbb-gold' },
}

/**
 * Lightest card in the system — badge, title, one/two lines. No image, no left border.
 * Flat category-tinted background only. Entire card is one tap target.
 */
export function VenueCompactCard({
  density,
  badge,
  badgeVariant,
  liveOpen = false,
  title,
  lines,
  href,
  external = false,
  categoryToken,
  className = '',
}: VenueCompactCardProps) {
  const token = tokenClass[categoryToken] ?? tokenClass.neutral
  const visibleLines =
    density === 'compact' ? lines.slice(0, 1) : lines.slice(0, 2)

  const body = (
    <>
      <p
        className={`flex items-center gap-1.5 font-ui text-label uppercase tracking-ui-label ${token.badge}`}
      >
        {badgeVariant === 'liveStatus' ? (
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              liveOpen ? 'bg-hbb-green' : 'bg-gray-400'
            }`}
          />
        ) : null}
        <span>{badge}</span>
      </p>
      <h3 className="mt-1.5 font-ui text-ui-md font-semibold text-hbb-black">{title}</h3>
      {visibleLines.map((line) => (
        <p key={line} className="mt-0.5 font-ui text-ui-sm text-gray-600">
          {line}
        </p>
      ))}
    </>
  )

  const sharedClass = [
    'venue-compact-card flex min-h-22 flex-col justify-center p-3 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hbb-teal focus-visible:ring-offset-2',
    token.shell,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (external) {
    return (
      <a href={href} className={sharedClass} target="_blank" rel="noopener noreferrer">
        {body}
      </a>
    )
  }

  return (
    <Link href={href as AppHref} className={sharedClass}>
      {body}
    </Link>
  )
}
