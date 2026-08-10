# Meeting documents (PDFs)

Managed in **Payload Admin → Meeting documents**. The public library lists whatever exists there — add, edit, or delete anytime.

## Bilingual files in Admin

1. Create / open a document  
2. Set **title** + upload **file** for the current locale (e.g. EN)  
3. Switch locale to **DE** in the admin bar  
4. Set the German title + upload the German PDF  
5. Save  

Optional **Page role**: mark one doc as “Hybrid teaser CTA” or “Food & drink teaser CTA”.

## Seed folders (optional bulk import)

```
meeting-pdf/
  de/<key>.pdf
  en/<key>.pdf
```

```bash
npm run seed:meeting-documents -- --force
```

| Filename key | DE title | EN title | Category | Area |
|---|---|---|---|---|
| `hybrid.pdf` | Hybride Konferenzen | Hybrid Meetings | hybrid | — |
| `banquet-folder.pdf` | Bankettmappe | Banquet Menu | general | — |
| `special-offer.pdf` | Spezialangebot | Special Offer | general | — |
| `brochure.pdf` | Broschüre | Factsheet | general | — |
| `floor-plan-overview.pdf` | Grundriss / Übersicht | Floorplan / Overview | floor-plan | — |
| `bereich-a.pdf` | Bereich A | Area A | floor-plan | bereich-a |
| `bereich-b.pdf` | Bereich B | Area B | floor-plan | bereich-b |
| `bereich-c.pdf` | Bereich C | Area C | floor-plan | bereich-c |
| `saal.pdf` | Bereich Saal | Berlin Ballroom | floor-plan | saal |
| `sustainability-2024.pdf` | Nachhaltigkeitsreport 2024 | Sustainability Report 2024 | sustainability | — |

Floor plans are **per area**, not per room — rooms in Area A share `bereich-a.pdf`.
