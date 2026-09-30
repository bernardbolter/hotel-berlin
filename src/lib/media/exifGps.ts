import exifr from 'exifr'

export type ExifGps = {
  latitude: number
  longitude: number
}

/** Read GPS from a phone photo. Returns null when absent or unreadable. */
export async function readExifGps(file: Blob): Promise<ExifGps | null> {
  try {
    const gps = await exifr.gps(file)
    if (!gps) return null
    const latitude = Number(gps.latitude)
    const longitude = Number(gps.longitude)
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null
    return { latitude, longitude }
  } catch {
    return null
  }
}

/** EXIF Orientation 1–8; 1 or missing = upright. */
export async function readExifOrientation(file: Blob): Promise<number> {
  try {
    const orientation = await exifr.orientation(file)
    const n = Number(orientation)
    return Number.isFinite(n) && n >= 1 && n <= 8 ? n : 1
  } catch {
    return 1
  }
}

export function formatGpsOffer(gps: ExifGps, locale: 'de' | 'en' = 'de'): string {
  const lat = gps.latitude.toFixed(4).replace('.', ',')
  const lng = gps.longitude.toFixed(4).replace('.', ',')
  if (locale === 'en') {
    return `This photo has a location: ${lat} · ${lng} — use it?`
  }
  return `Im Foto steckt ein Standort: ${lat} · ${lng} — übernehmen?`
}
