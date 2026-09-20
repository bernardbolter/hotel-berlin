'use client'

import type { ComponentProps, MouseEvent, ReactNode } from 'react'

import { Link } from '@/i18n/routing'

type Props = {
  href: ComponentProps<typeof Link>['href']
  children: ReactNode
}

/** Client wrapper so a click inside `<summary>` does not toggle the row. */
export function AmenityListMoreLink({ href, children }: Props) {
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    event.stopPropagation()
  }

  return (
    <Link href={href} className="amenity-list-row__more" onClick={onClick}>
      {children}
    </Link>
  )
}
