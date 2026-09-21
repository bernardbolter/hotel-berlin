import { NotFoundCopy, notFoundMetadata } from '@/components/status/NotFoundView'

export const generateMetadata = notFoundMetadata

/** `/here` layout already provides nav and footer. */
export default function HereNotFound() {
  return <NotFoundCopy />
}
