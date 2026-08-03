import type { Metadata } from 'next'

import { MapStylePreview } from '@/components/map/MapStylePreview'
import { getMapboxAccessToken } from '@/lib/map/config'

export const metadata: Metadata = {
  title: 'Map style preview',
  robots: { index: false, follow: false },
}

export default function MapStylesPage() {
  const accessToken = getMapboxAccessToken()

  return (
    <main id="main-content" className="bg-hbb-page">
      {!accessToken ? (
        <div className="px-section-sm py-16 md:px-section-x">
          <h1 className="font-display text-2xl text-hbb-black">Map style preview</h1>
          <p className="mt-3 max-w-xl font-ui text-ui-sm text-gray-600">
            Set <code className="text-hbb-forest">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> in{' '}
            <code>.env</code> to load the interactive map.
          </p>
        </div>
      ) : (
        <MapStylePreview accessToken={accessToken} />
      )}
    </main>
  )
}
