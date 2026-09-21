import { notFound } from 'next/navigation'

/** Unmatched locale routes render `[locale]/not-found.tsx` inside the site shell. */
export default function CatchAll() {
  notFound()
}
