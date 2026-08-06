/**
 * Map consent gate for the homepage Mapbox teaser.
 *
 * No CMP is wired in the repo yet (Cookiebot / Usercentrics / etc.). Until one
 * lands, this uses a localStorage preference so the teaser can ship with the
 * three UI states the brief requires (pending / granted / declined).
 *
 * When a CMP is added, replace the storage helpers here — keep the same
 * `MapConsentStatus` surface so HomepageMapTeaser stays unchanged.
 * Open item: confirm whether the CMP supports per-component consent vs
 * site-wide accept/decline only.
 */

export type MapConsentStatus = 'pending' | 'granted' | 'declined'

export const MAP_CONSENT_STORAGE_KEY = 'hbb-map-consent'

export function readMapConsent(): MapConsentStatus {
  if (typeof window === 'undefined') return 'pending'
  try {
    const raw = window.localStorage.getItem(MAP_CONSENT_STORAGE_KEY)
    if (raw === 'granted' || raw === 'declined') return raw
  } catch {
    // private mode / blocked storage
  }
  return 'pending'
}

export function writeMapConsent(status: 'granted' | 'declined'): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MAP_CONSENT_STORAGE_KEY, status)
  } catch {
    // ignore
  }
}
