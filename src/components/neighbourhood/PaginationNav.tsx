import { Link } from '@/i18n/routing'

type Props = {
  pathname: '/neighbourhood' | '/you-me-berlin'
  currentPage: number
  totalPages: number
  /** Query params to preserve across page links (excluding `page`). */
  query?: Record<string, string | undefined | null>
  ariaLabel: string
  previousLabel: string
  nextLabel: string
}

function pageHref(
  pathname: Props['pathname'],
  query: Props['query'],
  page: number,
) {
  const q: Record<string, string> = {}
  for (const [key, val] of Object.entries(query ?? {})) {
    if (val) q[key] = val
  }
  if (page > 1) q.page = String(page)

  return Object.keys(q).length > 0
    ? ({ pathname, query: q } as const)
    : ({ pathname } as const)
}

export function PaginationNav({
  pathname,
  currentPage,
  totalPages,
  query = {},
  ariaLabel,
  previousLabel,
  nextLabel,
}: Props) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav aria-label={ariaLabel} className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {currentPage > 1 ? (
        <Link
          href={pageHref(pathname, query, currentPage - 1)}
          className="inline-flex min-h-10 min-w-10 items-center justify-center border border-gray-200 px-3 font-ui text-ui-sm text-gray-600 hover:border-gray-400 hover:text-hbb-black"
        >
          {previousLabel}
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className="inline-flex min-h-10 min-w-10 items-center justify-center border border-transparent px-3 font-ui text-ui-sm text-gray-300"
        >
          {previousLabel}
        </span>
      )}

      {pages.map((page) => {
        const isCurrent = page === currentPage
        return (
          <Link
            key={page}
            href={pageHref(pathname, query, page)}
            aria-current={isCurrent ? 'page' : undefined}
            className={`inline-flex min-h-10 min-w-10 items-center justify-center border font-ui text-ui-sm transition-colors duration-200 ease-out motion-reduce:transition-none ${
              isCurrent
                ? 'border-hbb-green bg-hbb-green/10 text-hbb-green'
                : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:text-hbb-black'
            }`}
          >
            {page}
          </Link>
        )
      })}

      {currentPage < totalPages ? (
        <Link
          href={pageHref(pathname, query, currentPage + 1)}
          className="inline-flex min-h-10 min-w-10 items-center justify-center border border-gray-200 px-3 font-ui text-ui-sm text-gray-600 hover:border-gray-400 hover:text-hbb-black"
        >
          {nextLabel}
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className="inline-flex min-h-10 min-w-10 items-center justify-center border border-transparent px-3 font-ui text-ui-sm text-gray-300"
        >
          {nextLabel}
        </span>
      )}
    </nav>
  )
}
