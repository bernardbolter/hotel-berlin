export type HeroUiLocale = 'de' | 'en'

export function heroUiLocale(lang: string | undefined): HeroUiLocale {
  return lang?.toLowerCase().startsWith('en') ? 'en' : 'de'
}

const overwriteLabelsDe = {
  altDe: 'Alt-Text Deutsch',
  altEn: 'Alt-Text Englisch',
  descriptionDe: 'Beschreibung Deutsch',
  descriptionEn: 'Beschreibung Englisch',
  keywordsDe: 'Stichworte Deutsch',
  keywordsEn: 'Stichworte Englisch',
  venue: 'Ort',
  focal: 'Fokuspunkt',
} as const

const overwriteLabelsEn = {
  altDe: 'Alt text German',
  altEn: 'Alt text English',
  descriptionDe: 'Description German',
  descriptionEn: 'Description English',
  keywordsDe: 'Keywords German',
  keywordsEn: 'Keywords English',
  venue: 'Place',
  focal: 'Focal point',
} as const

const de = {
  startseiteTitle: 'Hero Startseite',
  hierTitle: 'Hero Hier',
  startseiteKicker: 'Startseite',
  hierKicker: 'Gästeseite /here',
  livePaused: (live: number, paused: number) =>
    `${live} Foto${live === 1 ? '' : 's'} live · ${paused} pausiert`,
  newPhoto: '+ Neues Foto',
  orderHeading: 'Reihenfolge',
  previewHeading: 'Vorschau',
  editHeading: 'Foto bearbeiten',
  newHeading: 'Neues Foto',
  photoHeading: 'Das Foto',
  aiHeading: 'Alles auf einmal',
  textHeading: 'Text',
  placeHeading: 'Ort und Bildunterschrift',
  translateHeading: 'Andere Sprache füllen',
  translateExplanation:
    'Eine Sprache ist schon da — Prompt kopieren, in der KI einfügen (ohne Foto), Antwort übernehmen. Nur leere Felder der anderen Sprache werden gefüllt.',
  translateCopy: 'Übersetzungs-Prompt kopieren',
  translateCopied: 'Kopiert',
  translatePaste: 'Übersetzung einfügen',
  translateApply: 'Übersetzung übernehmen',
  translateNothing: 'Nichts zu übersetzen — beide Sprachen sind schon gefüllt, oder die Ausgangssprache fehlt.',
  translateApplied: 'Fehlende Sprache übernommen.',
  translateToEn: 'Richtung: Deutsch → Englisch',
  translateToDe: 'Richtung: Englisch → Deutsch',
  rightsHeading: 'Rechte',
  photoFirst: 'Zuerst ein Foto.',
  emptyHomepage:
    'Noch keine Fotos. Ohne Fotos zeigt die Startseite eine graue Fläche.',
  emptyHere:
    'Noch keine eigenen Fotos. Die Gästeseite zeigt dann die Fotos der Startseite.',
  aiCopy: 'Prompt kopieren',
  aiCopied: 'Kopiert',
  aiPaste: 'Antwort einfügen',
  aiApply: 'Antwort übernehmen',
  aiApplySelected: 'Auswahl übernehmen',
  aiMalformed: 'Die Antwort konnte nicht gelesen werden.',
  aiExplanation:
    'Optional: oben Ort/Bildunterschrift (eine Sprache reicht). Dann 1) Prompt kopieren · 2) Foto in der KI anhängen · 3) JSON hier einfügen · 4) „Antwort übernehmen“. Leere Felder werden gefüllt; die fehlende Caption-Sprache kommt mit.',
  aiAppliedOk:
    'Texte übernommen. Als Nächstes: Fokuspunkt in der Vorschau prüfen (Klick oder „Punkt bestätigen“), Ort und Rechte prüfen, dann unten speichern.',
  hinweiseMissingEn:
    'Hinweise nur auf Deutsch (Englisch fehlte oder war identisch). Unten „Andere Sprache füllen“ nutzen oder Prompt neu übernehmen mit echtem hinweiseEn auf Englisch.',
  hinweiseMissingDe:
    'Hinweise nur auf Englisch (Deutsch fehlte oder war identisch). Unten „Andere Sprache füllen“ nutzen oder Prompt neu übernehmen mit echtem hinweiseDe auf Deutsch.',
  hinweiseOnlyDe: 'Nur deutsche Hinweise — Englisch fehlt. Unten „Andere Sprache füllen“.',
  hinweiseOnlyEn: 'Nur englische Hinweise — Deutsch fehlt. Unten „Andere Sprache füllen“.',
  hinweiseShowingOther:
    'Für diese Sprache fehlen Hinweise — unten die andere Sprache (vorerst).',
  aiTruncated: 'Einige Texte wurden auf die maximale Länge gekürzt.',
  aiOverwriteHint:
    'Diese Felder haben schon Inhalt. Anhaken, was ersetzt werden soll, dann „Auswahl übernehmen“.',
  overwriteNow: 'jetzt',
  overwriteNew: 'neu',
  overwriteLabels: overwriteLabelsDe,
  venueUnmatched: (name: string) =>
    `Ort „${name}" wurde nicht gefunden — bitte manuell wählen.`,
  altDe: 'Alt-Text Deutsch',
  altEn: 'Alt-Text Englisch',
  descriptionDe: 'Beschreibung Deutsch',
  descriptionEn: 'Beschreibung Englisch',
  keywordsDe: 'Stichworte Deutsch',
  keywordsEn: 'Stichworte Englisch',
  venue: 'Ort',
  captionPreview: 'Bildunterschrift',
  captionOverrideDe: 'Eigene Bildunterschrift Deutsch',
  captionOverrideEn: 'Eigene Bildunterschrift Englisch',
  captionOverrideHelp:
    'Nur nötig, wenn kein Ort passt. Eine Sprache reicht — die andere kommt über den KI-Prompt darunter.',
  captionOverrideHint:
    'Eine Sprache ausfüllen (oder beide). Beim Prompt kopieren wird sie mitgeschickt und übersetzt zurückgegeben.',
  credit: 'Bildnachweis',
  adminTitle: 'Interner Name',
  save: 'Speichern',
  saveLive: 'Speichern & live schalten',
  deleteSlide: 'Löschen',
  deleteConfirm: 'Dieses Foto wirklich löschen? Das lässt sich nicht rückgängig machen.',
  deleteFailed: 'Löschen ist fehlgeschlagen.',
  saving: 'Speichert…',
  reorderFailed: 'Reihenfolge konnte nicht gespeichert werden.',
  reorderLive: (from: number, to: number) => `Foto ${from} an Position ${to}`,
  paused: 'pausiert',
  live: 'live',
  desktopCrop: 'Desktop',
  mobileCrop: 'Handy',
  focalHint:
    'Klick oder Ziehen auf dem Bild setzt den Fokuspunkt und speichert ihn sofort — kein extra „Übernehmen“.',
  focalProposed:
    'Vorschlag der KI (weißer Ring). Passt er? „Punkt bestätigen“, oder Klick/Ziehen zum Verschieben — beides speichert sofort. „Antwort übernehmen“ oben gilt nur für die Texte.',
  focalConfirm: 'Punkt bestätigen',
  focalConfirmed: 'Fokuspunkt gespeichert.',
  missingPrefix: 'Fehlt noch:',
  canEnable: 'Kann live geschaltet werden',
  hinweiseTitle: 'Hinweise der KI',
  hinweiseCollapse: 'Einklappen',
  hinweiseExpand: 'Ausklappen',
  hinweiseLangDe: 'Deutsch',
  hinweiseLangEn: 'Englisch',
  privacy:
    'Keine Fotos mit erkennbaren Personen. Kostenlose KI-Dienste dürfen Uploads zum Training verwenden.',
  dropIdle: 'Foto ablegen, auswählen oder mit der Kamera aufnehmen',
  dropUploading: 'Wird hochgeladen…',
  uploadFailed: 'Upload fehlgeschlagen.',
  sessionExpired:
    'Sitzung abgelaufen. Bitte neu anmelden (Abmelden → Anmelden), dann erneut hochladen.',
  fileTooLarge: (mb: number) => `Die Datei ist zu groß (max. ${mb} MB nach dem Verkleinern).`,
  imageSmallHint: (got: number, ideal: number) =>
    `Hochgeladen. Hinweis: ${got} px lange Seite — ideal sind ${ideal} px für scharfe Darstellung auf großen Bildschirmen.`,
  loadFailed: 'Die Liste konnte nicht geladen werden.',
  genericError: 'Etwas ist schiefgelaufen. Bitte noch einmal versuchen.',
  listLinkStartseite: 'Hero Startseite verwalten',
  listLinkHier: 'Hero Hier verwalten',
  dashboardBlurbStartseite: 'Titelbilder der Startseite — Reihenfolge und Texte.',
  dashboardBlurbHier: 'Titelbilder der Gästeseite — Reihenfolge und Texte.',
  chars: (n: number, max: number) => `${n} / ${max}`,
  appendVisibleText: (text: string) => `Sichtbaren Text anhängen: „${text}"`,
} as const

const en = {
  startseiteTitle: 'Homepage hero',
  hierTitle: 'Here hero',
  startseiteKicker: 'Homepage',
  hierKicker: 'Guest hub /here',
  livePaused: (live: number, paused: number) =>
    `${live} live photo${live === 1 ? '' : 's'} · ${paused} paused`,
  newPhoto: '+ New photo',
  orderHeading: 'Order',
  previewHeading: 'Preview',
  editHeading: 'Edit photo',
  newHeading: 'New photo',
  photoHeading: 'The photo',
  aiHeading: 'All at once',
  textHeading: 'Text',
  placeHeading: 'Place and caption',
  translateHeading: 'Fill the other language',
  translateExplanation:
    'One language is already filled — copy the prompt, paste it into the AI (no photo), apply the reply. Only empty fields in the other language are filled.',
  translateCopy: 'Copy translate prompt',
  translateCopied: 'Copied',
  translatePaste: 'Paste translation',
  translateApply: 'Apply translation',
  translateNothing: 'Nothing to translate — both languages are filled, or the source language is empty.',
  translateApplied: 'Missing language applied.',
  translateToEn: 'Direction: German → English',
  translateToDe: 'Direction: English → German',
  rightsHeading: 'Rights',
  photoFirst: 'A photo first.',
  emptyHomepage: 'No photos yet. Without photos the homepage shows a grey panel.',
  emptyHere:
    'No photos of their own yet. The guest hub then shows the homepage photos.',
  aiCopy: 'Copy prompt',
  aiCopied: 'Copied',
  aiPaste: 'Paste reply',
  aiApply: 'Apply reply',
  aiApplySelected: 'Apply selection',
  aiMalformed: 'The reply could not be read.',
  aiExplanation:
    'Optional: set place/caption above first (one language is enough). Then 1) Copy the prompt · 2) Attach the photo in the AI · 3) Paste the JSON here · 4) “Apply reply”. Empty fields fill in; the missing caption language comes back too.',
  aiAppliedOk:
    'Texts applied. Next: confirm the focal point in the preview (click or “Confirm point”), check place and rights, then save below.',
  hinweiseMissingEn:
    'Notes only in German (English missing or identical). Use “Fill other language” below, or re-apply with real English hinweiseEn.',
  hinweiseMissingDe:
    'Notes only in English (German missing or identical). Use “Fill other language” below, or re-apply with real German hinweiseDe.',
  hinweiseOnlyDe: 'Only German notes — English missing. Use “Fill other language” below.',
  hinweiseOnlyEn: 'Only English notes — German missing. Use “Fill other language” below.',
  hinweiseShowingOther:
    'No notes for this language yet — showing the other language for now.',
  aiTruncated: 'Some texts were shortened to the maximum length.',
  aiOverwriteHint:
    'These fields already have content. Tick what should be replaced, then “Apply selection”.',
  overwriteNow: 'now',
  overwriteNew: 'new',
  overwriteLabels: overwriteLabelsEn,
  venueUnmatched: (name: string) =>
    `Place “${name}” was not found — please pick one manually.`,
  altDe: 'Alt text German',
  altEn: 'Alt text English',
  descriptionDe: 'Description German',
  descriptionEn: 'Description English',
  keywordsDe: 'Keywords German',
  keywordsEn: 'Keywords English',
  venue: 'Place',
  captionPreview: 'Caption',
  captionOverrideDe: 'Custom caption German',
  captionOverrideEn: 'Custom caption English',
  captionOverrideHelp:
    'Only needed when no place fits. One language is enough — the other comes back via the AI prompt below.',
  captionOverrideHint:
    'Fill one language (or both). When you copy the prompt it is included and returned translated.',
  credit: 'Photo credit',
  adminTitle: 'Internal label',
  save: 'Save',
  saveLive: 'Save & go live',
  deleteSlide: 'Delete',
  deleteConfirm: 'Delete this photo? This cannot be undone.',
  deleteFailed: 'Could not delete the photo.',
  saving: 'Saving…',
  reorderFailed: 'Order could not be saved.',
  reorderLive: (from: number, to: number) => `Photo ${from} to position ${to}`,
  paused: 'paused',
  live: 'live',
  desktopCrop: 'Desktop',
  mobileCrop: 'Phone',
  focalHint:
    'Click or drag on the image to set the focal point — it saves immediately. No separate Apply.',
  focalProposed:
    'AI proposal (white ring). OK? “Confirm point”, or click/drag to move — both save immediately. “Apply reply” above is only for the texts.',
  focalConfirm: 'Confirm point',
  focalConfirmed: 'Focal point saved.',
  missingPrefix: 'Still missing:',
  canEnable: 'Ready to go live',
  hinweiseTitle: 'AI notes',
  hinweiseCollapse: 'Collapse',
  hinweiseExpand: 'Expand',
  hinweiseLangDe: 'German',
  hinweiseLangEn: 'English',
  privacy:
    'No photos with recognisable people. Free AI services may use uploads for training.',
  dropIdle: 'Drop a photo, pick one, or use the camera',
  dropUploading: 'Uploading…',
  uploadFailed: 'Upload failed.',
  sessionExpired:
    'Session expired. Please sign in again (log out → log in), then retry the upload.',
  fileTooLarge: (mb: number) => `The file is too large (max ${mb} MB after compression).`,
  imageSmallHint: (got: number, ideal: number) =>
    `Uploaded. Note: ${got} px long edge — ${ideal} px is ideal for sharp display on large screens.`,
  loadFailed: 'Could not load the list.',
  genericError: 'Something went wrong. Please try again.',
  listLinkStartseite: 'Manage homepage hero',
  listLinkHier: 'Manage /here hero',
  dashboardBlurbStartseite: 'Homepage hero photos — order and copy.',
  dashboardBlurbHier: 'Guest-hub hero photos — order and copy.',
  chars: (n: number, max: number) => `${n} / ${max}`,
  appendVisibleText: (text: string) => `Append visible text: “${text}”`,
} as const

export const heroManagerCopy = { de, en } as const

export type HeroManagerCopy = (typeof heroManagerCopy)[HeroUiLocale]

export function heroCopy(lang: string | undefined): HeroManagerCopy {
  return heroManagerCopy[heroUiLocale(lang)]
}

/** Short photo help for hero uploads (DE primary; EN for admin language switch). */
export const heroPhotoHelp = {
  de: {
    short: 'Querformat, Motiv in der Mitte — Handy schneidet hart zu.',
    lead: 'Querformat. Das Wichtige im mittleren Drittel halten — auf dem Handy wird stark beschnitten. Kein Blitz, kein Text schon im Bild, keine erkennbaren Personen. Am besten mind. 2880 px breit (Empfehlung, kein Muss), Original nicht vorab verkleinern.',
    more: 'Der Fokuspunkt steuert, was nach dem Zuschnitt bleibt. Alt-Texte beschreiben das Motiv in einem Satz (höchstens 120 Zeichen), ohne Wertung. Bildnachweis und Stichworte helfen der Auffindbarkeit.',
  },
  en: {
    short: 'Landscape, subject in the middle — phones crop hard.',
    lead: 'Landscape. Keep the important part in the middle third — phones crop hard. No flash, no text already in the image, no recognisable people. Ideally at least 2880 px wide (recommended, not required); do not downscale the original first.',
    more: 'The focal point controls what survives the crop. Alt text describes the subject in one sentence (120 characters max), without judgement. Credit and keywords help discovery.',
  },
} as const
