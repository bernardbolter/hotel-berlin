import { Fragment, type ReactNode } from 'react'

export type EntityFactRow = { term: string; value: ReactNode }

export type EntityFactsProps = {
  rows: ReadonlyArray<EntityFactRow | null | false>
}

export function visibleFactRows(
  rows: EntityFactsProps['rows'],
): EntityFactRow[] {
  return rows.filter((row): row is EntityFactRow => Boolean(row && row.term && row.value))
}

export function EntityFacts({ rows }: EntityFactsProps) {
  const visible = visibleFactRows(rows)
  if (visible.length === 0) return null

  return (
    <dl className="entity-facts">
      {visible.map((row) => (
        <Fragment key={row.term}>
          <dt>{row.term}</dt>
          <dd>{row.value}</dd>
        </Fragment>
      ))}
    </dl>
  )
}
