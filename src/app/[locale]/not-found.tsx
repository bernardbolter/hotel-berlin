import { NotFoundView, notFoundMetadata } from '@/components/status/NotFoundView'

export const generateMetadata = notFoundMetadata

export default function LocaleNotFound() {
  return <NotFoundView />
}
