import type { ReactNode } from 'react'

export type BorrowedRowProps<T> = {
  items: ReadonlyArray<T>
  render: (item: T, index: number) => ReactNode
}

export function BorrowedRow<T>({ items, render }: BorrowedRowProps<T>) {
  if (items.length !== 3) return null

  return (
    <ul className="grid grid-cols-1 gap-8 sm:grid-cols-3">
      {items.map((item, index) => (
        <li key={index}>{render(item, index)}</li>
      ))}
    </ul>
  )
}
