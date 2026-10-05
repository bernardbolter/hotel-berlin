# Step 3 text diff

*Generated 2026-10-05. For Bernard review before production flag flip.*

| slug | locale | field | kind |
|---|---|---|---|
| `guest-checkout` | en | answer | token-conversion (no visible change) |
| `guest-checkout` | de | answer | token-conversion (no visible change) |
| `cancellation-flexible` | en | answer | token-conversion (no visible change) |
| `cancellation-flexible` | de | answer | token-conversion (no visible change) |
| `guest-nonsmoking` | en | answer | token-conversion (no visible change) |
| `guest-nonsmoking` | de | answer | token-conversion (no visible change) |
| `guest-sauna` | en | answer | token-conversion (no visible change) |
| `guest-sauna` | de | answer | token-conversion (no visible change) |
| `check-in-time` | en | question | merge (no visible change) |
| `check-in-time` | en | answer | merge (visible change) |
| `check-in-time` | de | question | merge (no visible change) |
| `check-in-time` | de | answer | merge (visible change) |
| `parking` | en | question | merge (no visible change) |
| `parking` | en | answer | merge (visible change) |
| `parking` | de | question | merge (no visible change) |
| `parking` | de | answer | merge (visible change) |
| `pet-policy` | en | question | merge (no visible change) |
| `pet-policy` | en | answer | merge (visible change) |
| `pet-policy` | de | question | merge (no visible change) |
| `pet-policy` | de | answer | merge (visible change) |
| `breakfast-times` | en | question | merge (visible change) |
| `breakfast-times` | en | answer | merge (visible change) |
| `breakfast-times` | de | question | merge (visible change) |
| `breakfast-times` | de | answer | merge (visible change) |
| `guest-card-only` | en | question | merge (no visible change) |
| `guest-card-only` | en | answer | merge (visible change) |
| `guest-card-only` | de | question | merge (no visible change) |
| `guest-card-only` | de | answer | merge (visible change) |
| `guest-pharmacy-nollendorf` | en | question | merge (no visible change) |
| `guest-pharmacy-nollendorf` | en | answer | merge (no visible change) |
| `guest-pharmacy-nollendorf` | de | question | merge (no visible change) |
| `guest-pharmacy-nollendorf` | de | answer | merge (no visible change) |
| `guest-emergency` | en | question | merge (no visible change) |
| `guest-emergency` | en | answer | merge (no visible change) |
| `guest-emergency` | de | question | merge (no visible change) |
| `guest-emergency` | de | answer | merge (no visible change) |

## Full text

### `guest-checkout` · en · answer
*token-conversion (no visible change)*

**Old**

```
Check-out is by 12:00. Later check-out is arranged with the lobby hosts — ask on the morning you leave.
```

**New**

```
Check-out is by {{checkoutTime}}. Later check-out is arranged with the lobby hosts — ask on the morning you leave.
```

### `guest-checkout` · de · answer
*token-conversion (no visible change)*

**Old**

```
Check-out ist bis 12:00. Späterer Check-out läuft über die Lobby Hosts — am Abreisetag in der Lobby fragen.
```

**New**

```
Check-out ist bis {{checkoutTime}}. Späterer Check-out läuft über die Lobby Hosts — am Abreisetag in der Lobby fragen.
```

### `cancellation-flexible` · en · answer
*token-conversion (no visible change)*

**Old**

```
Flexible rate bookings at Hotel Berlin, Berlin can be cancelled free of charge until 18:00 on the day of arrival. A late cancellation or no-show is charged at 90% of the first night.
```

**New**

```
Flexible rate bookings at Hotel Berlin, Berlin can be cancelled free of charge until {{cancelFlexibleUntil}} on the day of arrival. A late cancellation or no-show is charged at {{noShowCharge}} of the first night.
```

### `cancellation-flexible` · de · answer
*token-conversion (no visible change)*

**Old**

```
Flexible Buchungen im Hotel Berlin, Berlin können bis 18:00 am Anreisetag kostenfrei storniert werden. Bei später Stornierung oder No-Show werden 90 % der ersten Nacht berechnet.
```

**New**

```
Flexible Buchungen im Hotel Berlin, Berlin können bis {{cancelFlexibleUntil}} am Anreisetag kostenfrei storniert werden. Bei später Stornierung oder No-Show werden {{noShowCharge}} der ersten Nacht berechnet.
```

### `guest-nonsmoking` · en · answer
*token-conversion (no visible change)*

**Old**

```
No. This is a non-smoking hotel. Smoking in the room incurs a €250 cleaning fee.
```

**New**

```
No. This is a non-smoking hotel. Smoking in the room incurs a {{smokingFee}} cleaning fee.
```

### `guest-nonsmoking` · de · answer
*token-conversion (no visible change)*

**Old**

```
Nein. Das Haus ist ein Nichtraucherhotel. Rauchen im Zimmer kostet 250 € Reinigungsgebühr.
```

**New**

```
Nein. Das Haus ist ein Nichtraucherhotel. Rauchen im Zimmer kostet {{smokingFee}} Reinigungsgebühr.
```

### `guest-sauna` · en · answer
*token-conversion (no visible change)*

**Old**

```
The sauna is on request, with 45 minutes’ notice. Ask Guest Care to book a slot.
```

**New**

```
The sauna is on request, with {{saunaNotice}}’ notice. Ask Guest Care to book a slot.
```

### `guest-sauna` · de · answer
*token-conversion (no visible change)*

**Old**

```
Die Sauna ist auf Anfrage, 45 Minuten Vorlauf. Ein Slot läuft über das Guest Care Center.
```

**New**

```
Die Sauna ist auf Anfrage, {{saunaNotice}} Vorlauf. Ein Slot läuft über das Guest Care Center.
```

### `check-in-time` · en · question
*merge (no visible change)*

**Old**

```
What time can I check in at Hotel Berlin, Berlin?
```

**New**

```
What time can I check in at Hotel Berlin, Berlin?
```

### `check-in-time` · en · answer
*merge (visible change)*

**Old**

```
Check-in at Hotel Berlin, Berlin is from 15:00. Early check-in from 06:00 is available for €30 if a room is ready — or book the night before for guaranteed early access.
```

**New**

```
Check-in at Hotel Berlin, Berlin is from {{checkinTime}}. Early check-in from {{earlyCheckinFrom}} is available for {{earlyCheckinFee}} if a room is ready — or book the night before for guaranteed early access. If you arrive before your room is ready, the Guest Care Center can store your luggage until it is.
```

### `check-in-time` · de · question
*merge (no visible change)*

**Old**

```
Wann kann ich im Hotel Berlin, Berlin einchecken?
```

**New**

```
Wann kann ich im Hotel Berlin, Berlin einchecken?
```

### `check-in-time` · de · answer
*merge (visible change)*

**Old**

```
Check-in im Hotel Berlin, Berlin ist ab 15:00. Früher Check-in ab 06:00 gibt es für 30 €, wenn ein Zimmer bereit ist — oder die Nacht davor buchen für garantierten frühen Zugang.
```

**New**

```
Check-in im Hotel Berlin, Berlin ist ab {{checkinTime}}. Früher Check-in ab {{earlyCheckinFrom}} gibt es für {{earlyCheckinFee}}, wenn ein Zimmer bereit ist — oder die Nacht davor buchen für garantierten frühen Zugang. Wenn du früher ankommst, bewahrt das Guest Care Center dein Gepäck auf, bis das Zimmer bereit ist.
```

### `parking` · en · question
*merge (no visible change)*

**Old**

```
Is there parking at Hotel Berlin, Berlin?
```

**New**

```
Is there parking at Hotel Berlin, Berlin?
```

### `parking` · en · answer
*merge (visible change)*

**Old**

```
Yes. Hotel Berlin, Berlin has underground parking with over 200 spaces. €4 per hour, maximum €25 per day. EV charging is available nearby.
```

**New**

```
Yes. Hotel Berlin, Berlin has an underground garage with {{parkingSpaces}} spaces: {{parkingHourly}} per hour, maximum {{parkingDaily}} per day. Entry height is {{parkingMaxHeight}}. Access is from Karl-Heinrich-Ulrichs-Straße.
```

### `parking` · de · question
*merge (no visible change)*

**Old**

```
Gibt es Parkplätze im Hotel Berlin, Berlin?
```

**New**

```
Gibt es Parkplätze im Hotel Berlin, Berlin?
```

### `parking` · de · answer
*merge (visible change)*

**Old**

```
Ja. Das Hotel Berlin, Berlin hat eine Tiefgarage mit über 200 Plätzen. 4 € pro Stunde, maximal 25 € pro Tag. E-Ladestationen gibt es in der Nähe.
```

**New**

```
Ja. Das Hotel Berlin, Berlin hat eine Tiefgarage mit {{parkingSpaces}} Plätzen: {{parkingHourly}} pro Stunde, maximal {{parkingDaily}} pro Tag. Einfahrtshöhe {{parkingMaxHeight}}. Zufahrt über die Karl-Heinrich-Ulrichs-Straße.
```

### `pet-policy` · en · question
*merge (no visible change)*

**Old**

```
Are pets allowed at Hotel Berlin, Berlin?
```

**New**

```
Are pets allowed at Hotel Berlin, Berlin?
```

### `pet-policy` · en · answer
*merge (visible change)*

**Old**

```
Yes, pets are welcome at Hotel Berlin, Berlin. There is a charge of €30 per night. Pets are also welcome at breakfast.
```

**New**

```
Yes, pets are welcome at Hotel Berlin, Berlin. There is a charge of {{petFee}} per night. Pets are also welcome at breakfast.
```

### `pet-policy` · de · question
*merge (no visible change)*

**Old**

```
Sind Haustiere im Hotel Berlin, Berlin erlaubt?
```

**New**

```
Sind Haustiere im Hotel Berlin, Berlin erlaubt?
```

### `pet-policy` · de · answer
*merge (visible change)*

**Old**

```
Ja, Haustiere sind im Hotel Berlin, Berlin willkommen. 30 € pro Nacht. Haustiere sind auch beim Frühstück willkommen.
```

**New**

```
Ja, Haustiere sind im Hotel Berlin, Berlin willkommen. {{petFee}} pro Nacht. Haustiere sind auch beim Frühstück willkommen.
```

### `breakfast-times` · en · question
*merge (visible change)*

**Old**

```
What are the breakfast times at Hotel Berlin?
```

**New**

```
When is breakfast at Hotel Berlin, Berlin, and what does it cost?
```

### `breakfast-times` · en · answer
*merge (visible change)*

**Old**

```
Breakfast is served daily from 06:30 to 10:00. It is a full buffet with vegan options available.
```

**New**

```
Breakfast is served Monday to Friday {{breakfastWeekday}}, and Saturday and Sunday until 11:00. It is a full buffet with vegan options. {{breakfastPrice}} for adults, €12 from age 6.
```

### `breakfast-times` · de · question
*merge (visible change)*

**Old**

```
Wann ist das Frühstück im Hotel Berlin?
```

**New**

```
Wann gibt es im Hotel Berlin, Berlin Frühstück, und was kostet es?
```

### `breakfast-times` · de · answer
*merge (visible change)*

**Old**

```
Frühstück gibt es täglich von 06:30 bis 10:00. Volles Buffet mit veganen Optionen.
```

**New**

```
Frühstück gibt es Mo–Fr {{breakfastWeekday}}, Sa/So bis 11:00. Volles Buffet mit veganen Optionen. {{breakfastPrice}} Erwachsene, 12 € ab 6 Jahren.
```

### `guest-card-only` · en · question
*merge (no visible change)*

**Old**

```
Can I pay with cash?
```

**New**

```
Can I pay with cash?
```

### `guest-card-only` · en · answer
*merge (visible change)*

**Old**

```
No. The hotel is card and contactless only — no cash.
```

**New**

```
No. The hotel is card and contactless only — no cash. This applies to food and drink in the hotel too.
```

### `guest-card-only` · de · question
*merge (no visible change)*

**Old**

```
Kann ich bar zahlen?
```

**New**

```
Kann ich bar zahlen?
```

### `guest-card-only` · de · answer
*merge (visible change)*

**Old**

```
Nein. Zahlung nur mit Karte und kontaktlos — kein Bargeld.
```

**New**

```
Nein. Zahlung nur mit Karte und kontaktlos — kein Bargeld. Das gilt auch für Essen und Trinken im Haus.
```

### `guest-pharmacy-nollendorf` · en · question
*merge (no visible change)*

**Old**

```
Where is the nearest pharmacy?
```

**New**

```
Where is the nearest pharmacy?
```

### `guest-pharmacy-nollendorf` · en · answer
*merge (no visible change)*

**Old**

```
Quartier Apotheke Nolleturm, Nollendorfplatz 3–4. There is also a pharmacy at Wittenbergplatz, Bayreuther Straße 44.
```

**New**

```
Quartier Apotheke Nolleturm, Nollendorfplatz 3–4. There is also a pharmacy at Wittenbergplatz, Bayreuther Straße 44.
```

### `guest-pharmacy-nollendorf` · de · question
*merge (no visible change)*

**Old**

```
Wo ist die nächste Apotheke?
```

**New**

```
Wo ist die nächste Apotheke?
```

### `guest-pharmacy-nollendorf` · de · answer
*merge (no visible change)*

**Old**

```
Quartier Apotheke Nolleturm, Nollendorfplatz 3–4. Außerdem Apotheke am Wittenbergplatz, Bayreuther Straße 44.
```

**New**

```
Quartier Apotheke Nolleturm, Nollendorfplatz 3–4. Außerdem Apotheke am Wittenbergplatz, Bayreuther Straße 44.
```

### `guest-emergency` · en · question
*merge (no visible change)*

**Old**

```
What is the emergency number?
```

**New**

```
What is the emergency number?
```

### `guest-emergency` · en · answer
*merge (no visible change)*

**Old**

```
Call 112 for fire, ambulance, or police emergency. Trained staff are in the building around the clock.
```

**New**

```
Call 112 for fire, ambulance, or police emergency. Trained staff are in the building around the clock.
```

### `guest-emergency` · de · question
*merge (no visible change)*

**Old**

```
Wie ist der Notruf?
```

**New**

```
Wie ist der Notruf?
```

### `guest-emergency` · de · answer
*merge (no visible change)*

**Old**

```
Notruf 112 für Feuerwehr, Rettung und Polizei. Rund um die Uhr ist geschultes Personal im Haus.
```

**New**

```
Notruf 112 für Feuerwehr, Rettung und Polizei. Rund um die Uhr ist geschultes Personal im Haus.
```


---

## Resolved text (7 survivors)

*OLD = published text before Step 3 (from `existing-faqs.json`).*
*NEW = merge answer after token resolution (live hotel/amenity sources).*
*Questions compared as written (no tokens in survivor questions).*

### `check-in-time`

#### EN · question — **identical**

**OLD**

```
What time can I check in at Hotel Berlin, Berlin?
```

**NEW (resolved)**

```
What time can I check in at Hotel Berlin, Berlin?
```

#### EN · answer — **changed**

**OLD**

```
Check-in at Hotel Berlin, Berlin is from 15:00. Early check-in from 06:00 is available for €30 if a room is ready — or book the night before for guaranteed early access.
```

**NEW (resolved)**

```
Check-in at Hotel Berlin, Berlin is from 15:00. Early check-in from 06:00 is available for €30 if a room is ready — or book the night before for guaranteed early access. If you arrive before your room is ready, the Guest Care Center can store your luggage until it is.
```

#### DE · question — **identical**

**OLD**

```
Wann kann ich im Hotel Berlin, Berlin einchecken?
```

**NEW (resolved)**

```
Wann kann ich im Hotel Berlin, Berlin einchecken?
```

#### DE · answer — **changed**

**OLD**

```
Check-in im Hotel Berlin, Berlin ist ab 15:00. Früher Check-in ab 06:00 gibt es für 30 €, wenn ein Zimmer bereit ist — oder die Nacht davor buchen für garantierten frühen Zugang.
```

**NEW (resolved)**

```
Check-in im Hotel Berlin, Berlin ist ab 15:00. Früher Check-in ab 06:00 gibt es für 30 €, wenn ein Zimmer bereit ist — oder die Nacht davor buchen für garantierten frühen Zugang. Wenn du früher ankommst, bewahrt das Guest Care Center dein Gepäck auf, bis das Zimmer bereit ist.
```

### `parking`

#### EN · question — **identical**

**OLD**

```
Is there parking at Hotel Berlin, Berlin?
```

**NEW (resolved)**

```
Is there parking at Hotel Berlin, Berlin?
```

#### EN · answer — **changed**

**OLD**

```
Yes. Hotel Berlin, Berlin has underground parking with over 200 spaces. €4 per hour, maximum €25 per day. EV charging is available nearby.
```

**NEW (resolved)**

```
Yes. Hotel Berlin, Berlin has an underground garage with 208 spaces: €4 per hour, maximum €25 per day. Entry height is 1.80 m. Access is from Karl-Heinrich-Ulrichs-Straße.
```

#### DE · question — **identical**

**OLD**

```
Gibt es Parkplätze im Hotel Berlin, Berlin?
```

**NEW (resolved)**

```
Gibt es Parkplätze im Hotel Berlin, Berlin?
```

#### DE · answer — **changed**

**OLD**

```
Ja. Das Hotel Berlin, Berlin hat eine Tiefgarage mit über 200 Plätzen. 4 € pro Stunde, maximal 25 € pro Tag. E-Ladestationen gibt es in der Nähe.
```

**NEW (resolved)**

```
Ja. Das Hotel Berlin, Berlin hat eine Tiefgarage mit 208 Plätzen: 4 € pro Stunde, maximal 25 € pro Tag. Einfahrtshöhe 1,80 m. Zufahrt über die Karl-Heinrich-Ulrichs-Straße.
```

### `pet-policy`

#### EN · question — **identical**

**OLD**

```
Are pets allowed at Hotel Berlin, Berlin?
```

**NEW (resolved)**

```
Are pets allowed at Hotel Berlin, Berlin?
```

#### EN · answer — **identical**

**OLD**

```
Yes, pets are welcome at Hotel Berlin, Berlin. There is a charge of €30 per night. Pets are also welcome at breakfast.
```

**NEW (resolved)**

```
Yes, pets are welcome at Hotel Berlin, Berlin. There is a charge of €30 per night. Pets are also welcome at breakfast.
```

#### DE · question — **identical**

**OLD**

```
Sind Haustiere im Hotel Berlin, Berlin erlaubt?
```

**NEW (resolved)**

```
Sind Haustiere im Hotel Berlin, Berlin erlaubt?
```

#### DE · answer — **identical**

**OLD**

```
Ja, Haustiere sind im Hotel Berlin, Berlin willkommen. 30 € pro Nacht. Haustiere sind auch beim Frühstück willkommen.
```

**NEW (resolved)**

```
Ja, Haustiere sind im Hotel Berlin, Berlin willkommen. 30 € pro Nacht. Haustiere sind auch beim Frühstück willkommen.
```

### `breakfast-times`

#### EN · question — **changed**

**OLD**

```
What are the breakfast times at Hotel Berlin?
```

**NEW (resolved)**

```
When is breakfast at Hotel Berlin, Berlin, and what does it cost?
```

#### EN · answer — **changed**

**OLD**

```
Breakfast is served daily from 06:30 to 10:00. It is a full buffet with vegan options available.
```

**NEW (resolved)**

```
Breakfast is served Monday to Friday 06:30–10:00, and Saturday and Sunday until 11:00. It is a full buffet with vegan options. €23 for adults, €12 from age 6.
```

#### DE · question — **changed**

**OLD**

```
Wann ist das Frühstück im Hotel Berlin?
```

**NEW (resolved)**

```
Wann gibt es im Hotel Berlin, Berlin Frühstück, und was kostet es?
```

#### DE · answer — **changed**

**OLD**

```
Frühstück gibt es täglich von 06:30 bis 10:00. Volles Buffet mit veganen Optionen.
```

**NEW (resolved)**

```
Frühstück gibt es Mo–Fr 06:30–10:00, Sa/So bis 11:00. Volles Buffet mit veganen Optionen. 23 € Erwachsene, 12 € ab 6 Jahren.
```

### `guest-card-only`

#### EN · question — **identical**

**OLD**

```
Can I pay with cash?
```

**NEW (resolved)**

```
Can I pay with cash?
```

#### EN · answer — **changed**

**OLD**

```
No. The hotel is card and contactless only — no cash.
```

**NEW (resolved)**

```
No. The hotel is card and contactless only — no cash. This applies to food and drink in the hotel too.
```

#### DE · question — **identical**

**OLD**

```
Kann ich bar zahlen?
```

**NEW (resolved)**

```
Kann ich bar zahlen?
```

#### DE · answer — **changed**

**OLD**

```
Nein. Zahlung nur mit Karte und kontaktlos — kein Bargeld.
```

**NEW (resolved)**

```
Nein. Zahlung nur mit Karte und kontaktlos — kein Bargeld. Das gilt auch für Essen und Trinken im Haus.
```

### `guest-pharmacy-nollendorf`

#### EN · question — **identical**

**OLD**

```
Where is the nearest pharmacy?
```

**NEW (resolved)**

```
Where is the nearest pharmacy?
```

#### EN · answer — **identical**

**OLD**

```
Quartier Apotheke Nolleturm, Nollendorfplatz 3–4. There is also a pharmacy at Wittenbergplatz, Bayreuther Straße 44.
```

**NEW (resolved)**

```
Quartier Apotheke Nolleturm, Nollendorfplatz 3–4. There is also a pharmacy at Wittenbergplatz, Bayreuther Straße 44.
```

#### DE · question — **identical**

**OLD**

```
Wo ist die nächste Apotheke?
```

**NEW (resolved)**

```
Wo ist die nächste Apotheke?
```

#### DE · answer — **identical**

**OLD**

```
Quartier Apotheke Nolleturm, Nollendorfplatz 3–4. Außerdem Apotheke am Wittenbergplatz, Bayreuther Straße 44.
```

**NEW (resolved)**

```
Quartier Apotheke Nolleturm, Nollendorfplatz 3–4. Außerdem Apotheke am Wittenbergplatz, Bayreuther Straße 44.
```

### `guest-emergency`

#### EN · question — **identical**

**OLD**

```
What is the emergency number?
```

**NEW (resolved)**

```
What is the emergency number?
```

#### EN · answer — **identical**

**OLD**

```
Call 112 for fire, ambulance, or police emergency. Trained staff are in the building around the clock.
```

**NEW (resolved)**

```
Call 112 for fire, ambulance, or police emergency. Trained staff are in the building around the clock.
```

#### DE · question — **identical**

**OLD**

```
Wie ist der Notruf?
```

**NEW (resolved)**

```
Wie ist der Notruf?
```

#### DE · answer — **identical**

**OLD**

```
Notruf 112 für Feuerwehr, Rettung und Polizei. Rund um die Uhr ist geschultes Personal im Haus.
```

**NEW (resolved)**

```
Notruf 112 für Feuerwehr, Rettung und Polizei. Rund um die Uhr ist geschultes Personal im Haus.
```

### Summary table

| slug | locale | field | status |
|---|---|---|---|
| `check-in-time` | en | question | identical |
| `check-in-time` | en | answer | changed |
| `check-in-time` | de | question | identical |
| `check-in-time` | de | answer | changed |
| `parking` | en | question | identical |
| `parking` | en | answer | changed |
| `parking` | de | question | identical |
| `parking` | de | answer | changed |
| `pet-policy` | en | question | identical |
| `pet-policy` | en | answer | identical |
| `pet-policy` | de | question | identical |
| `pet-policy` | de | answer | identical |
| `breakfast-times` | en | question | changed |
| `breakfast-times` | en | answer | changed |
| `breakfast-times` | de | question | changed |
| `breakfast-times` | de | answer | changed |
| `guest-card-only` | en | question | identical |
| `guest-card-only` | en | answer | changed |
| `guest-card-only` | de | question | identical |
| `guest-card-only` | de | answer | changed |
| `guest-pharmacy-nollendorf` | en | question | identical |
| `guest-pharmacy-nollendorf` | en | answer | identical |
| `guest-pharmacy-nollendorf` | de | question | identical |
| `guest-pharmacy-nollendorf` | de | answer | identical |
| `guest-emergency` | en | question | identical |
| `guest-emergency` | en | answer | identical |
| `guest-emergency` | de | question | identical |
| `guest-emergency` | de | answer | identical |
