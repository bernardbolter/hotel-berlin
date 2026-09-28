import { Link } from '@/i18n/routing'
import { categoryTokenForEventCategory, resolveCategoryToken } from '@/lib/spotlight/categoryTokens'

export type EntityEventCardProps = {
  name: string
  slug: string
  category?: string | null
  meta?: string
}

export function EntityEventCard({ name, slug, category, meta }: EntityEventCardProps) {
  const token = categoryTokenForEventCategory(category)
  const style = resolveCategoryToken(token)

  return (
    <article>
      <Link
        href={{ pathname: '/happenings/[slug]', params: { slug } }}
        className="flex aspect-4/3 flex-col justify-end border-l-4 bg-[var(--bg-subtle)] px-4 py-4 motion-safe:transition-opacity hover:opacity-90"
        style={{ borderLeftColor: style.fill }}
      >
        <h3 className="font-ui text-ui-md font-medium text-[var(--dim)]">{name}</h3>
      </Link>
      {meta ? <p className="mt-2 font-ui text-ui-xs text-[var(--dim)]">{meta}</p> : null}
    </article>
  )
}
