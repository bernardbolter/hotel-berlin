# Photo and alt-text help, as it appears in the admin

*For Cursor · 1 October 2026 · German is the primary; English is the switch value.*
*Goes into the guided flow (step 1) and the `media` / `artworks` field descriptions.*

---

## 1. The photo field

**DE**

> Ein Foto des Werks, möglichst gerade von vorne. Lass ringsum etwas Wand stehen – etwa 10 %: die Website schneidet das Foto je nach Stelle unterschiedlich zu. Kein Blitz (spiegelt und macht die Oberfläche flach), lieber das Licht im Flur anschalten. Keine erkennbaren Personen im Bild. Lade das Original hoch, nicht verkleinert – die Website erzeugt alle Größen selbst. Mindestens 864 px breit.

**EN**

> A photograph of the work, as square-on as you can. Leave some wall around it, about 10% – the site crops it differently in different places. No flash (it reflects and flattens the surface); switch the corridor lights on instead. No recognisable people in the picture. Upload the original, not a resized copy – the site makes every size it needs. At least 864 px wide.

## 2. The context photo field

**DE**

> Optional: ein zweites Foto, einen Schritt zurück. Flur, Aufzüge, die Ecke, in der das Werk hängt. Oft das schönere Bild, weil es zeigt, dass hier ein Haus mit Kunst ist und nicht nur ein Bild an einer Wand.

**EN**

> Optional: a second photograph, one step back. The corridor, the lifts, the corner it hangs in. Often the better picture, because it shows a building with art in it rather than a picture of a painting.

## 3. Alt text

**DE**

> Beschreibe das Foto in einem Satz für Menschen, die es nicht sehen können – zum Beispiel, weil sie einen Screenreader benutzen. Was ist zu sehen: Motiv, Farben, Technik, wo es hängt. Nicht mit „Bild von" oder „Foto von" anfangen, den Titel nicht wiederholen, nichts dazuerfinden. Höchstens 160 Zeichen.
>
> **Gut:** „Sprühbild eines Kolibris in Neonfarben auf einer weißen Wand neben dem Haupteingang."
> **Nicht so gut:** „Vogel" · „Bild von Pisa73" · „A01-lobby-pisa73.jpg"

**EN**

> Describe the photograph in one sentence for someone who cannot see it – a screen-reader user, for example. What is in it: subject, colours, technique, where it hangs. Don't start with "image of" or "photo of", don't repeat the title, don't add anything you can't see. 160 characters at most.
>
> **Good:** "Spray-painted hummingbird in neon colours on a white wall beside the main entrance."
> **Less good:** "Bird" · "Picture by Pisa73" · "A01-lobby-pisa73.jpg"

---

## 4. „Alt-Text mit KI erstellen" — the copyable prompt

A collapsed row under the alt-text fields, `Alt-Text mit KI erstellen`, opening to a short explanation, the prompt in a box, and a **copy button**.

**DE, the explanation**

> Du kannst den Alt-Text auch von einem KI-Chat schreiben lassen: Foto hochladen, den Text unten einfügen, die beiden Zeilen zurückkopieren. Bitte danach durchlesen – die KI sieht nur das Foto und weiß nicht, wo im Haus es hängt.
>
> Keine Fotos mit erkennbaren Personen hochladen. Bei kostenlosen KI-Diensten können die Bilder zum Training verwendet werden.

**EN, the explanation**

> You can have an AI chat write the alt text: upload the photograph, paste the text below, copy the two lines back. Read them over afterwards – the AI only sees the photo and doesn't know where in the building it hangs.
>
> Don't upload photographs with recognisable people in them. Free AI services may use the images for training.

**The prompt itself (one box, copied as-is):**

```
Schreibe einen Alt-Text für dieses Foto, für die Website eines Hotels.

Regeln:
- Ein Satz, höchstens 160 Zeichen.
- Beschreibe, was zu sehen ist: Motiv, Farben, Technik, Untergrund.
- Beginne nicht mit „Bild von" oder „Foto von".
- Keine Interpretation, keine Stimmung, keine Vermutungen über
  Künstler, Jahr oder Titel. Nur was im Bild sichtbar ist.
- Wenn eine Person erkennbar ist, schreibe das als Hinweis dazu.

Gib genau zwei Zeilen zurück:
DE: <der Satz auf Deutsch>
EN: <derselbe Satz auf Englisch>
```

The prompt is in German and asks for both languages, so one paste produces both fields.

---

## Where each string goes

| String | Placement |
|---|---|
| 1 | `admin.description` on the artwork's image field, **and** shown in full in step 1 of `/admin/neues-werk` |
| 2 | `admin.description` on the context image field |
| 3 | `admin.description` on `media.alt`, **and** in step 1 next to the two alt fields |
| 4 | Collapsed row under the alt fields, in the guided flow **and** on the media edit view |

Long help text belongs in the guided flow, where someone is doing the thing for the first time. On the ordinary edit form, keep the description to its first sentence and let the rest sit behind the same collapsed row.

## Notes for the build

- The copy button copies the prompt only, not the surrounding explanation.
- No model is called anywhere here. This is text and a clipboard.
- When the alt-text helper is built later, it appears **beside** this row rather than replacing it: the copyable prompt keeps working when the AI is switched off, and for anyone who prefers their own tool.
