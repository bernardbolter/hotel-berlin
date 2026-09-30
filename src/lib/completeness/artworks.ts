import { partitionIssues, type CompletenessIssue, type CompletenessResult } from './types'

/**
 * Minimal artwork shape for completeness. Accepts Payload docs, form drafts,
 * or guided-entry state — relationship fields may be ids or populated objects.
 */
export type ArtworkCompletenessInput = {
  artist?: number | { id?: number | null } | null
  locationInBuilding?: {
    floor?: string | null
    /** DE spot (primary). EN is optional and never blocking. */
    spot?: string | null
  } | null
  images?: Array<{
    image?: number | { id?: number | null } | null
    /** Row alt — treated as DE when media locale alts are absent. */
    alt?: string | null
  } | null> | null
  /**
   * Localized alt on the linked media record for the lead photo.
   * Guided entry writes DE on upload; EN is a warning until filled.
   */
  photoAlt?: {
    de?: string | null
    en?: string | null
  } | null
  /** Artist consent to publish the photograph. */
  permission?: 'granted' | 'open' | 'denied' | null
}

function hasRelation(value: number | { id?: number | null } | null | undefined): boolean {
  if (value == null) return false
  if (typeof value === 'number') return value > 0
  return typeof value.id === 'number' && value.id > 0
}

function firstImage(doc: ArtworkCompletenessInput) {
  const row = doc.images?.find((r) => r != null) ?? null
  if (!row || !hasRelation(row.image ?? null)) return null
  return row
}

function altDe(doc: ArtworkCompletenessInput, row: { alt?: string | null }): string {
  return (doc.photoAlt?.de?.trim() || row.alt?.trim() || '')
}

function altEn(doc: ArtworkCompletenessInput): string {
  return doc.photoAlt?.en?.trim() || ''
}

/**
 * Publish gate for an artwork (GuidedEntry + sidebar + dashboard).
 *
 * Blocking: photo, artist, floor, spot, alt DE.
 * Warning: alt EN (optional at entry, flagged until filled).
 */
export function checkArtworkCompleteness(doc: ArtworkCompletenessInput): CompletenessResult {
  const issues: CompletenessIssue[] = []

  const row = firstImage(doc)
  if (!row) {
    issues.push({
      code: 'artwork.photo',
      severity: 'blocking',
      field: 'images',
      message: {
        de: 'Foto fehlt',
        en: 'Photo is missing',
      },
    })
  } else if (!altDe(doc, row)) {
    issues.push({
      code: 'artwork.altDe',
      severity: 'blocking',
      field: 'images.0.alt',
      message: {
        de: 'Alt-Text (DE) fehlt',
        en: 'Alt text (DE) is missing',
      },
    })
  } else if (!altEn(doc)) {
    issues.push({
      code: 'artwork.altEn',
      severity: 'warning',
      field: 'photoAlt.en',
      message: {
        de: 'Alt-Text (EN) fehlt noch',
        en: 'Alt text (EN) is still missing',
      },
    })
  }

  if (!hasRelation(doc.artist ?? null)) {
    issues.push({
      code: 'artwork.artist',
      severity: 'blocking',
      field: 'artist',
      message: {
        de: 'Künstler:in fehlt',
        en: 'Artist is missing',
      },
    })
  }

  const floor = doc.locationInBuilding?.floor?.trim()
  if (!floor) {
    issues.push({
      code: 'artwork.floor',
      severity: 'blocking',
      field: 'locationInBuilding.floor',
      message: {
        de: 'Ort im Haus fehlt',
        en: 'Place in the building is missing',
      },
    })
  }

  const spot = doc.locationInBuilding?.spot?.trim()
  if (!spot) {
    issues.push({
      code: 'artwork.spot',
      severity: 'blocking',
      field: 'locationInBuilding.spot',
      message: {
        de: 'Ort fehlt',
        en: 'Spot is missing',
      },
    })
  }

  const permission = doc.permission ?? 'open'
  if (permission !== 'granted') {
    issues.push({
      code: 'artwork.permission',
      severity: 'blocking',
      field: 'permission',
      message: {
        de:
          permission === 'denied'
            ? 'Foto-Freigabe abgelehnt — Veröffentlichung gesperrt'
            : 'Foto-Freigabe noch offen — Veröffentlichung gesperrt',
        en:
          permission === 'denied'
            ? 'Photo permission denied — publishing blocked'
            : 'Photo permission still open — publishing blocked',
      },
    })
  }

  return partitionIssues(issues)
}

/** True when the guided-entry / publish button may proceed. */
export function canPublishArtwork(doc: ArtworkCompletenessInput): boolean {
  return checkArtworkCompleteness(doc).complete
}
