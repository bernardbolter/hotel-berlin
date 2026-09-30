'use client'

import { useHashOpen } from '@/hooks/useHashOpen'

/** Mount on list pages that open `<details>` from the URL hash. */
export function HashOpen(): null {
  useHashOpen()
  return null
}
