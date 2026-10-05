# Flag ON vs OFF — FAQ block + JSON-LD diff

**Result: IDENTICAL**

Surfaces: home mini, /rooms mini, /here hub × DE+EN.

Captured before Step 3 content writes. Flag-ON server started with `FAQ_ROUTING_V2=true` (verified on Next CLI process env). Flag-OFF captured earlier from the default (unset) server.

## home-de (`/de`)
- identical — ids=['check-in-time', 'parking', 'pet-policy', 'airport-transfer'], questions=4, jsonld=4

## home-en (`/en`)
- identical — ids=['check-in-time', 'parking', 'pet-policy', 'airport-transfer'], questions=4, jsonld=4

## rooms-de (`/de/zimmer`)
- identical — ids=['check-in-time', 'parking', 'pet-policy', 'airport-transfer'], questions=4, jsonld=4

## rooms-en (`/en/rooms`)
- identical — ids=['check-in-time', 'parking', 'pet-policy', 'airport-transfer'], questions=4, jsonld=4

## here-de (`/de/hier`)
- identical — ids=['guest-wifi', 'guest-luggage', 'guest-checkout'], questions=3, jsonld=3

## here-en (`/en/here`)
- identical — ids=['guest-wifi', 'guest-luggage', 'guest-checkout'], questions=3, jsonld=3
