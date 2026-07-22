import { buildMapboxStaticImageUrl } from '@/lib/map/mapbox'
import type { MapBounds } from '@/lib/map/config'

type Props = {
  bounds?: MapBounds
  center?: { lat: number; lng: number }
  zoom?: number
  width: number
  height: number
  fallbackSrc: string
  alt?: string
  className?: string
}

export function MapboxStaticImage({
  bounds,
  center,
  zoom,
  width,
  height,
  fallbackSrc,
  alt = '',
  className = '',
}: Props) {
  const src =
    buildMapboxStaticImageUrl({ width, height, bounds, center, zoom }) ?? fallbackSrc

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} className={className} />
  )
}
