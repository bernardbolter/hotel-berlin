export type MeetingRoomsManagerLocale = 'de' | 'en'

export function meetingRoomsManagerLocale(
  lang: string | undefined,
): MeetingRoomsManagerLocale {
  return lang?.toLowerCase().startsWith('en') ? 'en' : 'de'
}

const de = {
  title: 'Tagungsräume verwalten',
  intro:
    'Ziehen zum Sortieren. Änderungen speichern automatisch. Klick auf eine Zeile öffnet die Bearbeitung.',
  sliderHeading: 'Startseite „Meet & Work“',
  sliderCount: (n: number, loop: number) =>
    n === 0
      ? 'Keine Folien'
      : `${n} Folie${n === 1 ? '' : 'n'} · Umlauf ≈ ${loop}s (${n} × 7s)`,
  sliderEmpty:
    'Slider ist leer — die Startseite zeigt dann die Folien aus dem Hotel-Global bzw. das Standardfoto.',
  sliderWarn: (max: number) =>
    `Mehr als ${max} Folien — besser die Startseiten-Rotation kürzer halten.`,
  availableHeading: 'Verfügbare Tagungsräume',
  availableHint: 'In den Slider ziehen oder „Hinzufügen“.',
  allInSlider: 'Alle Tagungsräume sind im Slider.',
  dropHint: 'Tagungsraum hier ablegen oder unten hinzufügen.',
  pageHeading: 'Reihenfolge auf der Tagungsseite',
  pageHint: 'Steuert die Reihenfolge unter /tagungen und /meetings.',
  add: 'Hinzufügen',
  remove: 'Entfernen',
  inSlider: 'Im Slider',
  noImages: 'Keine Fotos',
  saving: 'Speichern…',
  saved: 'Gespeichert',
  saveError: 'Fehler — Liste zurückgesetzt',
  loading: 'Tagungsräume werden geladen…',
  retry: 'Erneut versuchen',
  complete: 'Vollständig',
  incomplete: 'Unvollständig',
  missingPhotos: (n: number) => `Weniger als 2 Fotos (${n})`,
  missingAlt: (i: number) => `Foto ${i}: Bildbeschreibung DE oder EN fehlt`,
  tabPhotos: 'Fotos',
  tabDetails: 'Details',
  close: 'Schließen',
  dropPhotos: 'Fotos hier ablegen oder',
  browse: 'Auswählen',
  uploading: 'Wird hochgeladen…',
  warnings: 'Hinweise',
  cover: 'Titelbild',
  makeCover: 'Als Titelbild festlegen',
  replacePhoto: 'Foto ersetzen',
  removeFromRoom: 'Aus Raum entfernen',
  removeConfirm:
    'Dieses Foto aus dem Tagungsraum entfernen? Die Mediendatei bleibt erhalten.',
  photoEditHeading: 'Foto bearbeiten',
  photoEditHelp:
    '1) Fokuspunkt per Klick setzen · 2) Bildbeschreibung DE/EN eintragen · 3) „Foto speichern“.',
  saveImage: 'Foto speichern',
  altDe: 'Bildbeschreibung DE',
  altEn: 'Bildbeschreibung EN',
  focalHint: (x: number, y: number) =>
    `Klick auf das Bild setzt den Fokuspunkt (${x}% / ${y}%)`,
  noPhotos: 'Noch keine Fotos.',
  loadingPhotos: 'Fotos werden geladen…',
  nameDe: 'Name DE',
  nameEn: 'Name EN',
  shortDe: 'Beschreibung DE',
  shortEn: 'Beschreibung EN',
  size: 'Größe (m²)',
  area: 'Bereich',
  hasDaylight: 'Tageslicht',
  hasScreen: 'Bildschirm',
  hasProjector: 'Beamer',
  visibleOnSite: 'Auf der Website anzeigen',
  visibleHint:
    'Ausgeblendete Räume erscheinen nicht auf der Startseite, unter /tagungen und in der Sitemap.',
  richTextHint:
    'Lange Beschreibung. Die Kartentexte werden daraus bei 160 Zeichen mit … gekürzt.',
  save: 'Speichern',
  openFull: 'Im vollständigen Editor öffnen',
  versions: 'Vorherige Versionen',
  viewOnSite: 'Auf der Website ansehen',
  narrowImage: (i: number, w: number) =>
    `Foto ${i}: nur ${w} px breit (empfohlen ≥ 2000 px)`,
  errGeneric: 'Speichern fehlgeschlagen',
} as const

const en = {
  title: 'Meeting Rooms Manager',
  intro:
    'Drag to reorder. Changes save automatically. Click a row to edit without leaving.',
  sliderHeading: 'Homepage “Meet & Work”',
  sliderCount: (n: number, loop: number) =>
    n === 0
      ? 'No slides'
      : `${n} slide${n === 1 ? '' : 's'} · loop ≈ ${loop}s (${n} × 7s)`,
  sliderEmpty:
    'Slider is empty — the homepage falls back to the Hotel global slides or the default photo.',
  sliderWarn: (max: number) =>
    `More than ${max} slides — consider keeping the homepage rotation shorter.`,
  availableHeading: 'Available meeting rooms',
  availableHint: 'Drag into the slider or use Add.',
  allInSlider: 'All meeting rooms are in the slider.',
  dropHint: 'Drop a meeting room here, or use Add below.',
  pageHeading: 'Meetings page order',
  pageHint: 'Controls listing order on /meetings and /tagungen.',
  add: 'Add',
  remove: 'Remove',
  inSlider: 'In slider',
  noImages: 'No photos',
  saving: 'Saving…',
  saved: 'Saved',
  saveError: 'Error — list reverted',
  loading: 'Loading meeting rooms…',
  retry: 'Retry',
  complete: 'Complete',
  incomplete: 'Incomplete',
  missingPhotos: (n: number) => `Fewer than 2 photos (${n})`,
  missingAlt: (i: number) => `Photo ${i}: missing alt DE or EN`,
  tabPhotos: 'Photos',
  tabDetails: 'Details',
  close: 'Close',
  dropPhotos: 'Drop photos here or',
  browse: 'Browse',
  uploading: 'Uploading…',
  warnings: 'Warnings',
  cover: 'Cover',
  makeCover: 'Make cover',
  replacePhoto: 'Replace photo',
  removeFromRoom: 'Remove from room',
  removeConfirm: 'Remove this photo from the meeting room? The media file is kept.',
  photoEditHeading: 'Edit photo',
  photoEditHelp:
    '1) Click to set the focal point · 2) Alt text DE/EN · 3) “Save photo”.',
  saveImage: 'Save photo',
  altDe: 'Alt text DE',
  altEn: 'Alt text EN',
  focalHint: (x: number, y: number) => `Click the image to set the focal point (${x}% / ${y}%)`,
  noPhotos: 'No photos yet.',
  loadingPhotos: 'Loading photos…',
  nameDe: 'Name DE',
  nameEn: 'Name EN',
  shortDe: 'Description DE',
  shortEn: 'Description EN',
  size: 'Size (m²)',
  area: 'Area',
  hasDaylight: 'Daylight',
  hasScreen: 'Screen',
  hasProjector: 'Projector',
  visibleOnSite: 'Show on website',
  visibleHint: 'Hidden rooms disappear from the homepage, /meetings and the sitemap.',
  richTextHint:
    'Long description. Card copy is truncated from it at 160 characters with …',
  save: 'Save',
  openFull: 'Open full editor',
  versions: 'Previous versions',
  viewOnSite: 'View on website',
  narrowImage: (i: number, w: number) => `Photo ${i}: only ${w}px wide (recommended ≥ 2000px)`,
  errGeneric: 'Save failed',
} as const

const meetingRoomsManagerCopyMap = { de, en } as const

export type MeetingRoomsManagerCopy =
  (typeof meetingRoomsManagerCopyMap)[MeetingRoomsManagerLocale]

export function meetingRoomsManagerCopy(
  lang: string | undefined,
): MeetingRoomsManagerCopy {
  return meetingRoomsManagerCopyMap[meetingRoomsManagerLocale(lang)]
}

export const MEETING_AREA_OPTIONS = [
  { value: 'saal', label: 'Berlin Ballroom' },
  { value: 'bereich-a', label: 'Area A' },
  { value: 'bereich-b', label: 'Area B' },
  { value: 'bereich-c', label: 'Area C' },
  { value: 'sonderflaeche', label: 'Meeting Island' },
] as const

export type MeetingAreaValue = (typeof MEETING_AREA_OPTIONS)[number]['value']
