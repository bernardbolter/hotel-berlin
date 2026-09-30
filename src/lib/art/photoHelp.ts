/**
 * Photo + alt-text help for admin (guided entry + field descriptions).
 * Source: doc/art/HotelBerlin_ArtPhoto_AltText_HelpStrings.md (plus F3 / guided fixes)
 */

import {
  MEDIA_JPEG_QUALITY,
  MEDIA_MASTER_EDGE,
  MEDIA_MAX_FILE_SIZE_MB,
} from '@/lib/media/limits'

export type PhotoHelpLocale = 'de' | 'en'

const jpegPct = Math.round(MEDIA_JPEG_QUALITY * 100)

export const ART_ALT_AI_PROMPT = `Schreibe einen Alt-Text für dieses Foto, für die Website eines Hotels.

Regeln:
- Ein Satz, höchstens 120 Zeichen. Kurz ist besser als vollständig.
- Beginne mit dem Motiv, nicht mit der Wand oder dem Ort.
- Einfache Wörter. Kein „befindet sich", kein „featuring".
- Beschreibe, was zu sehen ist: Motiv, Farben, Technik, Untergrund.
- Beginne nicht mit „Bild von" oder „Foto von".
- Keine Interpretation, keine Stimmung, keine Vermutungen über
  Künstler, Jahr oder Titel. Nur was im Bild sichtbar ist.
- Wenn eine Person erkennbar ist, schreibe das als Hinweis dazu.

Gib genau zwei Zeilen zurück:
DE: <der Satz auf Deutsch>
EN: <derselbe Satz auf Englisch>`

export const artPhotoHelp = {
  de: {
    photo: {
      lead: 'Ein Foto des Werks, möglichst gerade von vorne. Lass ringsum etwas Wand stehen – etwa 10 %: die Website schneidet das Foto je nach Stelle unterschiedlich zu.',
      more: `Kein Blitz (spiegelt und macht die Oberfläche flach), lieber das Licht im Flur anschalten. Keine erkennbaren Personen im Bild. Lade das Original vom Handy – vor dem Speichern wird die lange Seite auf höchstens ${MEDIA_MASTER_EDGE} px gebracht (JPEG, Qualität ${jpegPct} %), nie darunter: heller braucht die Hero-Größe. Dateien unter ${MEDIA_MASTER_EDGE} px werden abgelehnt. Nach dem Verkleinern höchstens ${MEDIA_MAX_FILE_SIZE_MB} MB; bei Bedarf sinkt nur die Qualität, nicht die Kantenlänge.`,
      short: `Ein Foto des Werks, möglichst gerade von vorne. Lange Seite mindestens ${MEDIA_MASTER_EDGE} px; gespeichert höchstens ${MEDIA_MASTER_EDGE} px / ${MEDIA_MAX_FILE_SIZE_MB} MB (JPEG ${jpegPct} %).`,
    },
    context: {
      lead: 'Optional: ein zweites Foto, einen Schritt zurück. Flur, Aufzüge, die Ecke, in der das Werk hängt.',
      more: 'Oft das schönere Bild, weil es zeigt, dass hier ein Haus mit Kunst ist und nicht nur ein Bild an einer Wand.',
      short: 'Optional: ein zweites Foto, einen Schritt zurück.',
    },
    alt: {
      lead: 'Beschreibe das Foto in einem Satz für Menschen, die es nicht sehen können – zum Beispiel, weil sie einen Screenreader benutzen. Was ist zu sehen: Motiv, Farben, Technik, wo es hängt.',
      more: 'Nicht mit „Bild von" oder „Foto von" anfangen, den Titel nicht wiederholen, nichts dazuerfinden. Höchstens 120 Zeichen. Kurz ist besser als vollständig.',
      short:
        'Beschreibe das Foto in einem Satz für Menschen, die es nicht sehen können – zum Beispiel, weil sie einen Screenreader benutzen.',
      goodExample:
        'Gut: „Sprühbild eines Kolibris in Neonfarben auf einer weißen Wand neben dem Haupteingang."',
      badExample: 'Nicht so gut: „Vogel" · „Bild von Pisa73" · „A01-lobby-pisa73.jpg"',
    },
    moreLabel: 'Mehr',
    lessLabel: 'Weniger',
    ai: {
      summary: 'Alt-Text mit KI erstellen',
      explanation:
        'Du kannst den Alt-Text auch von einem KI-Chat schreiben lassen: Foto hochladen, den Text unten einfügen, die beiden Zeilen zurückkopieren. Bitte danach durchlesen – die KI sieht nur das Foto und weiß nicht, wo im Haus es hängt.\n\nKeine Fotos mit erkennbaren Personen hochladen. Bei kostenlosen KI-Diensten können die Bilder zum Training verwendet werden.',
      copy: 'Prompt kopieren',
      copied: 'Kopiert',
    },
  },
  en: {
    photo: {
      lead: 'A photograph of the work, as square-on as you can. Leave some wall around it, about 10% – the site crops it differently in different places.',
      more: `No flash (it reflects and flattens the surface); switch the corridor lights on instead. No recognisable people in the picture. Upload the phone original – before storing, the long edge is capped at ${MEDIA_MASTER_EDGE} px (JPEG, quality ${jpegPct} %), never below: the hero size needs that. Files under ${MEDIA_MASTER_EDGE} px are rejected. After compression at most ${MEDIA_MAX_FILE_SIZE_MB} MB; if needed only quality drops, not the pixel edge.`,
      short: `A photograph of the work, as square-on as you can. Long edge at least ${MEDIA_MASTER_EDGE} px; stored at most ${MEDIA_MASTER_EDGE} px / ${MEDIA_MAX_FILE_SIZE_MB} MB (JPEG ${jpegPct} %).`,
    },
    context: {
      lead: 'Optional: a second photograph, one step back. The corridor, the lifts, the corner it hangs in.',
      more: 'Often the better picture, because it shows a building with art in it rather than a picture of a painting.',
      short: 'Optional: a second photograph, one step back.',
    },
    alt: {
      lead: 'Describe the photograph in one sentence for someone who cannot see it – a screen-reader user, for example. What is in it: subject, colours, technique, where it hangs.',
      more: 'Don\'t start with "image of" or "photo of", don\'t repeat the title, don\'t add anything you can\'t see. 120 characters at most. Short is better than complete.',
      short:
        'Describe the photograph in one sentence for someone who cannot see it – a screen-reader user, for example.',
      goodExample:
        'Good: "Spray-painted hummingbird in neon colours on a white wall beside the main entrance."',
      badExample: 'Less good: "Bird" · "Picture by Pisa73" · "A01-lobby-pisa73.jpg"',
    },
    moreLabel: 'More',
    lessLabel: 'Less',
    ai: {
      summary: 'Create alt text with AI',
      explanation:
        'You can have an AI chat write the alt text: upload the photograph, paste the text below, copy the two lines back. Read them over afterwards – the AI only sees the photo and doesn\'t know where in the building it hangs.\n\nDon\'t upload photographs with recognisable people in them. Free AI services may use the images for training.',
      copy: 'Copy prompt',
      copied: 'Copied',
    },
  },
} as const

export function artPhotoHelpLocale(code: string | undefined): PhotoHelpLocale {
  return code?.toLowerCase().startsWith('en') ? 'en' : 'de'
}
