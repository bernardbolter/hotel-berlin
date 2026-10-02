export type RoomsManagerLocale = 'de' | 'en'

export function roomsManagerLocale(lang: string | undefined): RoomsManagerLocale {
  return lang?.toLowerCase().startsWith('en') ? 'en' : 'de'
}

const de = {
  title: 'Zimmer verwalten',
  intro:
    'Ziehen zum Sortieren. Änderungen speichern automatisch. Klick auf eine Zeile öffnet die Bearbeitung.',
  sliderHeading: 'Startseiten-Slider',
  sliderCount: (n: number, loop: number) =>
    n === 0
      ? 'Keine Folien'
      : `${n} Folie${n === 1 ? '' : 'n'} · Umlauf ≈ ${loop}s (${n} × 7s)`,
  sliderEmpty:
    'Slider ist leer — die Website zeigt dann alle hervorgehobenen Zimmer.',
  sliderWarn: (max: number) =>
    `Mehr als ${max} Folien — besser die Startseiten-Rotation kürzer halten.`,
  availableHeading: 'Verfügbare Zimmer',
  availableHint: 'In den Slider ziehen oder „Hinzufügen“.',
  allInSlider: 'Alle Zimmer sind im Slider.',
  dropHint: 'Zimmer hier ablegen oder unten hinzufügen.',
  pageHeading: 'Reihenfolge auf der Zimmerseite',
  pageHint: 'Steuert die Reihenfolge unter /rooms und /zimmer.',
  add: 'Hinzufügen',
  remove: 'Entfernen',
  inSlider: 'Im Slider',
  noImages: 'Keine Fotos',
  saving: 'Speichern…',
  saved: 'Gespeichert',
  saveError: 'Fehler — Liste zurückgesetzt',
  loading: 'Zimmer werden geladen…',
  retry: 'Erneut versuchen',
  guests: 'Pers.',
  from: 'ab',
  complete: 'Vollständig',
  incomplete: 'Unvollständig',
  missingPhotos: (n: number) => `Weniger als 4 Fotos (${n})`,
  missingAlt: (i: number) => `Foto ${i}: Bildbeschreibung DE oder EN fehlt`,
  missingFocal: 'Titelbild: Fokuspunkt noch 50/50',
  missingWide: 'Titelbild: shotType sollte „wide“ sein',
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
  removeFromRoom: 'Aus Zimmer entfernen',
  removeConfirm:
    'Dieses Foto aus dem Zimmer entfernen? Die Mediendatei bleibt erhalten.',
  photoEditHeading: 'Foto bearbeiten',
  photoEditHelp:
    '1) Fokuspunkt per Klick setzen · 2) Bildbeschreibung DE/EN (oder KI unten) · 3) Aufnahmeart wählen · 4) „Foto speichern“.',
  aiHeading: 'Mit KI ausfüllen',
  aiExplanation:
    '1) Prompt kopieren · 2) Foto in der KI anhängen und Prompt einfügen · 3) JSON hier einfügen · 4) „JSON übernehmen“ (füllt die Felder inkl. Aufnahmeart) · 5) Prüfen und „Foto speichern“.',
  aiCopy: 'Prompt kopieren',
  aiCopied: 'Kopiert',
  aiPaste: 'KI-Antwort (JSON) einfügen',
  aiInvalid: 'Die Antwort konnte nicht gelesen werden. Bitte nur das JSON einfügen.',
  aiEmpty: 'Im JSON fehlen verwertbare Felder.',
  aiApplied: 'JSON übernommen — Felder prüfen, dann speichern.',
  aiAppliedHint: 'Felder sind gefüllt. Oben „Foto speichern“ klicken.',
  applyJson: 'JSON übernehmen',
  cancelJson: 'Abbrechen',
  fillPreview: 'Übernommen',
  fillFields: 'JSON übernehmen',
  saveImage: 'Foto speichern',
  saveAfterApply: 'Zuerst „JSON übernehmen“, dann speichern.',
  altDe: 'Bildbeschreibung DE',
  altEn: 'Bildbeschreibung EN',
  captionDe: 'Bildunterschrift DE',
  captionEn: 'Bildunterschrift EN',
  shotType: 'Aufnahmeart',
  focalHint: (x: number, y: number) =>
    `Klick auf das Bild setzt den Fokuspunkt (${x}% / ${y}%)`,
  pasteJson: 'Analyse-JSON einfügen',
  pasteJsonPlaceholder:
    '{"altDe":"…","altEn":"…","captionOverrideDe":"…","captionOverrideEn":"…","shotType":"wide","fokuspunkt":{"x":40,"y":55}}',
  noPhotos: 'Noch keine Fotos.',
  loadingPhotos: 'Fotos werden geladen…',
  nameDe: 'Name DE',
  nameEn: 'Name EN',
  shortDe: 'Beschreibung DE',
  shortEn: 'Beschreibung EN',
  size: 'Größe (m²)',
  maxGuests: 'Max. Personen',
  fromPrice: 'Preis ab (EUR)',
  amenities: 'Ausstattung',
  noAmenities: 'Keine Ausstattungs-Tags gefunden.',
  visibleOnSite: 'Auf der Website anzeigen',
  visibleHint: 'Ausgeblendete Zimmer erscheinen nicht im Slider, unter /rooms und in der Sitemap.',
  richTextHint:
    'Lange Beschreibung. Auf Listen und in Meta-Texten wird sie bei 160 Zeichen mit … gekürzt.',
  save: 'Speichern',
  openFull: 'Im vollständigen Editor öffnen',
  versions: 'Vorherige Versionen',
  viewOnSite: 'Auf der Website ansehen',
  duplicateMedia: (room: string) =>
    `Dieses Medium wird bereits in „${room}“ verwendet.`,
  duplicateFilename: (name: string, room: string) =>
    `Dateiname „${name}“ bereits in „${room}“ verwendet.`,
  errType: 'Nur JPG, PNG, WebP oder HEIC sind erlaubt.',
  errSize: 'Die Datei ist größer als 20 MB.',
  errWidth: (w: number) =>
    `Bild nur ${w} px breit — empfohlen sind mindestens 2000 px für scharfe Darstellung.`,
  narrowImage: (i: number, w: number) =>
    `Foto ${i}: nur ${w} px breit (empfohlen ≥ 2000 px)`,
  errGeneric: 'Speichern fehlgeschlagen',
  unauthorized: 'Keine Berechtigung.',
  pendingAlt: 'Bildbeschreibung fehlt',
} as const

const en = {
  title: 'Rooms Manager',
  intro:
    'Drag to reorder. Changes save automatically. Click a row to edit without leaving.',
  sliderHeading: 'Homepage slider',
  sliderCount: (n: number, loop: number) =>
    n === 0
      ? 'No slides'
      : `${n} slide${n === 1 ? '' : 's'} · loop ≈ ${loop}s (${n} × 7s)`,
  sliderEmpty: 'Slider is empty — the site falls back to featured rooms.',
  sliderWarn: (max: number) =>
    `More than ${max} slides — consider keeping the homepage rotation shorter.`,
  availableHeading: 'Available rooms',
  availableHint: 'Drag into the slider or use Add.',
  allInSlider: 'All rooms are in the slider.',
  dropHint: 'Drop a room here, or use Add below.',
  pageHeading: 'Rooms page order',
  pageHint: 'Controls listing order on /rooms and /zimmer.',
  add: 'Add',
  remove: 'Remove',
  inSlider: 'In slider',
  noImages: 'No photos',
  saving: 'Saving…',
  saved: 'Saved',
  saveError: 'Error — list reverted',
  loading: 'Loading rooms…',
  retry: 'Retry',
  guests: 'guests',
  from: 'from',
  complete: 'Complete',
  incomplete: 'Incomplete',
  missingPhotos: (n: number) => `Fewer than 4 photos (${n})`,
  missingAlt: (i: number) => `Photo ${i}: missing alt DE or EN`,
  missingFocal: 'Cover: focal still 50/50',
  missingWide: 'Cover: shotType should be “wide”',
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
  removeConfirm: 'Remove this photo from the room? The media file is kept.',
  photoEditHeading: 'Edit photo',
  photoEditHelp:
    '1) Click to set the focal point · 2) Alt text DE/EN (or use AI below) · 3) Pick shot type · 4) “Save photo”.',
  aiHeading: 'Fill with AI',
  aiExplanation:
    '1) Copy the prompt · 2) Attach the photo in the AI and paste the prompt · 3) Paste the JSON here · 4) “Apply JSON” (fills the fields including shot type) · 5) Review and “Save photo”.',
  aiCopy: 'Copy prompt',
  aiCopied: 'Copied',
  aiPaste: 'Paste AI reply (JSON)',
  aiInvalid: 'Could not read the reply. Paste the JSON only.',
  aiEmpty: 'No usable fields found in the JSON.',
  aiApplied: 'JSON applied — review the fields, then save.',
  aiAppliedHint: 'Fields are filled. Click “Save photo” above.',
  applyJson: 'Apply JSON',
  cancelJson: 'Cancel',
  fillPreview: 'Applied',
  fillFields: 'Apply JSON',
  saveImage: 'Save photo',
  saveAfterApply: 'Apply the JSON first, then save.',
  altDe: 'Alt text DE',
  altEn: 'Alt text EN',
  captionDe: 'Caption DE',
  captionEn: 'Caption EN',
  shotType: 'Shot type',
  focalHint: (x: number, y: number) => `Click the image to set the focal point (${x}% / ${y}%)`,
  pasteJson: 'Paste analysis JSON',
  pasteJsonPlaceholder:
    '{"altDe":"…","altEn":"…","captionOverrideDe":"…","captionOverrideEn":"…","shotType":"wide","fokuspunkt":{"x":40,"y":55}}',
  noPhotos: 'No photos yet.',
  loadingPhotos: 'Loading photos…',
  nameDe: 'Name DE',
  nameEn: 'Name EN',
  shortDe: 'Description DE',
  shortEn: 'Description EN',
  size: 'Size (m²)',
  maxGuests: 'Max guests',
  fromPrice: 'From-price (EUR)',
  amenities: 'Amenities',
  noAmenities: 'No amenity tags found.',
  visibleOnSite: 'Show on website',
  visibleHint:
    'Hidden rooms disappear from the slider, /rooms and the sitemap.',
  richTextHint:
    'Long description. On lists and in meta text it is truncated at 160 characters with …',
  save: 'Save',
  openFull: 'Open full editor',
  versions: 'Previous versions',
  viewOnSite: 'View on website',
  duplicateMedia: (room: string) => `This media is already used in “${room}”.`,
  duplicateFilename: (name: string, room: string) =>
    `Filename “${name}” is already used in “${room}”.`,
  errType: 'Only JPG, PNG, WebP or HEIC are allowed.',
  errSize: 'The file is larger than 20 MB.',
  errWidth: (w: number) =>
    `Image is only ${w}px wide — 2000px or more is recommended for sharp display.`,
  narrowImage: (i: number, w: number) => `Photo ${i}: only ${w}px wide (recommended ≥ 2000px)`,
  errGeneric: 'Save failed',
  unauthorized: 'Unauthorized.',
  pendingAlt: 'Alt text missing',
} as const

const roomsManagerCopyMap = { de, en } as const

export type RoomsManagerCopy = (typeof roomsManagerCopyMap)[RoomsManagerLocale]

export function roomsManagerCopy(lang: string | undefined): RoomsManagerCopy {
  return roomsManagerCopyMap[roomsManagerLocale(lang)]
}
