import type { FaqCategory } from '@/lib/faqs'

export type GuestAzFaq = {
  slug: string
  category: FaqCategory
  order: number
  en: { question: string; answer: string }
  de: { question: string; answer: string }
}

/**
 * Guest A–Z for /here/faq. Both locales required.
 * Do not seed WiFi credentials or sauna clock times.
 */
export const GUEST_AZ_FAQS: GuestAzFaq[] = [
  // —— Ankommen & Abreisen ——
  {
    slug: 'guest-checkin',
    category: 'arrival-departure',
    order: 10,
    en: {
      question: 'What time is check-in?',
      answer:
        'Check-in is from 15:00. If you arrive earlier, Guest Care can store your luggage until your room is ready.',
    },
    de: {
      question: 'Wann ist der Check-in?',
      answer:
        'Check-in ist ab 15:00. Wenn du früher ankommst, bewahrt das Guest Care Center dein Gepäck auf, bis das Zimmer bereit ist.',
    },
  },
  {
    slug: 'guest-checkout',
    category: 'arrival-departure',
    order: 3,
    en: {
      question: 'What time is check-out?',
      answer:
        'Check-out is by 12:00. Later check-out is arranged with the lobby hosts — ask on the morning you leave.',
    },
    de: {
      question: 'Wann ist der Check-out?',
      answer:
        'Check-out ist bis 12:00. Späterer Check-out läuft über die Lobby Hosts — am Abreisetag in der Lobby fragen.',
    },
  },
  {
    slug: 'guest-luggage',
    category: 'arrival-departure',
    order: 2,
    en: {
      question: 'Where can I store luggage before check-in or after check-out?',
      answer:
        'Luggage storage is available before check-in and after check-out. Ask at the Guest Care Center beside the lobby.',
    },
    de: {
      question: 'Wo kann ich mein Gepäck vor dem Check-in oder nach dem Check-out lassen?',
      answer:
        'Gepäckaufbewahrung gibt es vor dem Check-in und nach dem Check-out. Frag im Guest Care Center neben der Lobby.',
    },
  },
  {
    slug: 'guest-lost-and-found',
    category: 'arrival-departure',
    order: 11,
    en: {
      question: 'Where is lost property?',
      answer: 'Lost property is handled by the Guest Care Center beside the lobby, 24/7.',
    },
    de: {
      question: 'Wo ist das Fundbüro?',
      answer: 'Fundbüro läuft über das Guest Care Center neben der Lobby, rund um die Uhr.',
    },
  },
  {
    slug: 'guest-do-not-disturb',
    category: 'arrival-departure',
    order: 12,
    en: {
      question: 'How does the do-not-disturb sign work?',
      answer:
        'Use the do-not-disturb sign on your door. Housekeeping will skip the room until you take it down.',
    },
    de: {
      question: 'Wie funktioniert das Bitte-nicht-stören-Schild?',
      answer:
        'Das Bitte-nicht-stören-Schild hängt an die Tür. Housekeeping lässt das Zimmer dann in Ruhe, bis du es abnimmst.',
    },
  },

  // —— Im Zimmer ——
  {
    slug: 'guest-wifi',
    category: 'in-room',
    order: 1,
    en: {
      question: 'How do I connect to the hotel WiFi?',
      answer:
        'Ask at the Guest Care Center beside the lobby for the current network details. They will get you online.',
    },
    de: {
      question: 'Wie verbinde ich mich mit dem WLAN?',
      answer:
        'Die aktuellen Netzdaten gibt es im Guest Care Center neben der Lobby. Dort wirst du online gebracht.',
    },
  },
  {
    slug: 'guest-minibar',
    category: 'in-room',
    order: 20,
    en: {
      question: 'Is there a minibar?',
      answer:
        'The minibar is empty on purpose — use it as your own fridge. Snacks and drinks are at Wundermart in the lobby, 24/7.',
    },
    de: {
      question: 'Gibt es eine Minibar?',
      answer:
        'Die Minibar ist leer und als eigener Kühlschrank gedacht. Snacks und Getränke gibt es 24/7 im Wundermart in der Lobby.',
    },
  },
  {
    slug: 'guest-safe',
    category: 'in-room',
    order: 21,
    en: {
      question: 'How do I use the room safe?',
      answer: 'Room safes are set up through the Guest Care Center beside the lobby.',
    },
    de: {
      question: 'Wie nutze ich den Zimmersafe?',
      answer: 'Zimmersafes richtet das Guest Care Center neben der Lobby ein.',
    },
  },
  {
    slug: 'guest-housekeeping',
    category: 'in-room',
    order: 22,
    en: {
      question: 'How often is housekeeping?',
      answer: 'Housekeeping is daily. Bed linen is changed every three days.',
    },
    de: {
      question: 'Wie oft kommt Housekeeping?',
      answer: 'Housekeeping kommt täglich. Bettwäsche wird alle drei Tage gewechselt.',
    },
  },
  {
    slug: 'guest-iron',
    category: 'in-room',
    order: 23,
    en: {
      question: 'Can I get an iron?',
      answer: 'Yes — dial 9 from the room phone and Guest Care will bring an iron.',
    },
    de: {
      question: 'Kann ich ein Bügeleisen bekommen?',
      answer: 'Ja — über die 9 vom Zimmertelefon, dann bringt Guest Care ein Bügeleisen.',
    },
  },
  {
    slug: 'guest-adapter',
    category: 'in-room',
    order: 24,
    en: {
      question: 'Where can I get a plug adapter?',
      answer: 'Adapters are in Wundermart in the lobby, 24/7, card payment.',
    },
    de: {
      question: 'Wo bekomme ich einen Adapter?',
      answer: 'Adapter liegen im Wundermart in der Lobby, 24/7, Zahlung per Karte.',
    },
  },
  {
    slug: 'guest-air-conditioning',
    category: 'in-room',
    order: 25,
    en: {
      question: 'Can I adjust the air conditioning?',
      answer: 'Yes. The room climate can be adjusted by about ±3 °C.',
    },
    de: {
      question: 'Kann ich die Klimaanlage einstellen?',
      answer: 'Ja. Die Zimmertemperatur lässt sich um etwa ±3 °C regeln.',
    },
  },
  {
    slug: 'guest-tap-water',
    category: 'in-room',
    order: 26,
    en: {
      question: 'Is the tap water drinkable?',
      answer: 'Yes. Berlin tap water is drinking water.',
    },
    de: {
      question: 'Ist das Leitungswasser trinkbar?',
      answer: 'Ja. Berliner Leitungswasser ist Trinkwasser.',
    },
  },
  {
    slug: 'guest-phone-rates',
    category: 'in-room',
    order: 27,
    en: {
      question: 'What does the room phone cost?',
      answer:
        'Calls in Germany are €0.40 per minute. International calls are €0.80–€3.20 per minute.',
    },
    de: {
      question: 'Was kostet das Zimmertelefon?',
      answer:
        'Inland kostet 0,40 €/Min. Ausland kostet 0,80–3,20 €/Min.',
    },
  },

  // —— Geld & Bezahlen ——
  {
    slug: 'guest-card-only',
    category: 'money-payment',
    order: 30,
    en: {
      question: 'Can I pay with cash?',
      answer: 'No. The hotel is card and contactless only — no cash.',
    },
    de: {
      question: 'Kann ich bar zahlen?',
      answer: 'Nein. Zahlung nur mit Karte und kontaktlos — kein Bargeld.',
    },
  },
  {
    slug: 'guest-atm',
    category: 'money-payment',
    order: 31,
    en: {
      question: 'Where is the nearest ATM?',
      answer: 'Commerzbank has an ATM across the street from the hotel.',
    },
    de: {
      question: 'Wo ist der nächste Geldautomat?',
      answer: 'Commerzbank hat einen Geldautomaten gegenüber dem Hotel.',
    },
  },
  {
    slug: 'guest-currency-exchange',
    category: 'money-payment',
    order: 32,
    en: {
      question: 'Can I change money at the hotel?',
      answer:
        'There is no bureau de change in the hotel. The nearest is at Bahnhof Zoologischer Garten.',
    },
    de: {
      question: 'Kann ich im Hotel Geld wechseln?',
      answer:
        'Im Haus gibt es keine Wechselstube. Die nächste ist im Bahnhof Zoologischer Garten.',
    },
  },

  // —— Gesundheit & Notfall ——
  {
    slug: 'guest-medical-on-call',
    category: 'health-emergency',
    order: 40,
    en: {
      question: 'Who do I call for a doctor out of hours?',
      answer: 'The on-call medical service is 116 117. For emergencies call 112.',
    },
    de: {
      question: 'Wen rufe ich außerhalb der Sprechzeiten?',
      answer: 'Ärztlicher Bereitschaftsdienst: 116 117. Notruf: 112.',
    },
  },
  {
    slug: 'guest-emergency',
    category: 'health-emergency',
    order: 41,
    en: {
      question: 'What is the emergency number?',
      answer:
        'Call 112 for fire, ambulance, or police emergency. Trained staff are in the building around the clock.',
    },
    de: {
      question: 'Wie ist der Notruf?',
      answer:
        'Notruf 112 für Feuerwehr, Rettung und Polizei. Rund um die Uhr ist geschultes Personal im Haus.',
    },
  },
  {
    slug: 'guest-gp',
    category: 'health-emergency',
    order: 42,
    en: {
      question: 'Is there a GP nearby?',
      answer: 'There is a GP at Nollendorfplatz, about a 10-minute walk.',
    },
    de: {
      question: 'Gibt es einen Hausarzt in der Nähe?',
      answer: 'Hausarzt am Nollendorfplatz, etwa 10 Minuten zu Fuß.',
    },
  },
  {
    slug: 'guest-pharmacy-nollendorf',
    category: 'health-emergency',
    order: 43,
    en: {
      question: 'Where is the nearest pharmacy?',
      answer:
        'Quartier Apotheke Nolleturm, Nollendorfplatz 3–4. There is also a pharmacy at Wittenbergplatz, Bayreuther Straße 44.',
    },
    de: {
      question: 'Wo ist die nächste Apotheke?',
      answer:
        'Quartier Apotheke Nolleturm, Nollendorfplatz 3–4. Außerdem Apotheke am Wittenbergplatz, Bayreuther Straße 44.',
    },
  },
  {
    slug: 'guest-pharmacy-wittenbergplatz',
    category: 'health-emergency',
    order: 44,
    en: {
      question: 'Is there a pharmacy at Wittenbergplatz?',
      answer: 'Yes — Apotheke am Wittenbergplatz, Bayreuther Straße 44.',
    },
    de: {
      question: 'Gibt es eine Apotheke am Wittenbergplatz?',
      answer: 'Ja — Apotheke am Wittenbergplatz, Bayreuther Straße 44.',
    },
  },
  {
    slug: 'guest-babysitting',
    category: 'health-emergency',
    order: 45,
    en: {
      question: 'Can the hotel arrange babysitting?',
      answer: 'Yes. Guest Care can book a babysitting agency for you.',
    },
    de: {
      question: 'Kann das Hotel Babysitting organisieren?',
      answer: 'Ja. Das Guest Care Center vermittelt eine Babysitting-Agentur.',
    },
  },
  {
    slug: 'guest-staff-24-7',
    category: 'health-emergency',
    order: 46,
    en: {
      question: 'Is there staff in the building at night?',
      answer: 'Yes. Trained staff are in the hotel around the clock.',
    },
    de: {
      question: 'Ist nachts jemand im Haus?',
      answer: 'Ja. Rund um die Uhr ist geschultes Personal im Haus.',
    },
  },

  // —— Unterwegs ——
  {
    slug: 'guest-parking',
    category: 'getting-around',
    order: 50,
    en: {
      question: 'How does parking work?',
      answer:
        'The underground garage has 208 spaces, €4 per hour, max €25 per day. Entry height is 1.80 m. Access is from Karl-Heinrich-Ulrichs-Straße.',
    },
    de: {
      question: 'Wie funktioniert das Parken?',
      answer:
        'Die Tiefgarage hat 208 Plätze, 4 €/Std., max. 25 €/Tag. Einfahrtshöhe 1,80 m. Zufahrt über die Karl-Heinrich-Ulrichs-Straße.',
    },
  },
  {
    slug: 'guest-ev-charging',
    category: 'getting-around',
    order: 51,
    en: {
      question: 'Is there EV charging?',
      answer: 'Yes. 8 AC points, up to 22 kW, Type 2.',
    },
    de: {
      question: 'Gibt es E-Laden?',
      answer: 'Ja. 8 AC-Punkte, bis 22 kW, Typ 2.',
    },
  },
  {
    slug: 'guest-bike-garage',
    category: 'getting-around',
    order: 52,
    en: {
      question: 'Can I store a bike?',
      answer: 'Yes. There is a bike garage with e-bike charging.',
    },
    de: {
      question: 'Kann ich ein Fahrrad unterstellen?',
      answer: 'Ja. Es gibt eine Fahrradgarage mit E-Bike-Ladung.',
    },
  },
  {
    slug: 'guest-car-rental',
    category: 'getting-around',
    order: 53,
    en: {
      question: 'Where can I rent a car?',
      answer:
        'StarCar is at Schillstraße 9, about a minute away. Avis, Hertz and Europcar are at Tauentzienstraße 9–11, about 10 minutes.',
    },
    de: {
      question: 'Wo kann ich ein Auto mieten?',
      answer:
        'StarCar, Schillstraße 9, 1 Minute. Avis, Hertz und Europcar, Tauentzienstraße 9–11, 10 Minuten.',
    },
  },
  {
    slug: 'guest-taxi',
    category: 'getting-around',
    order: 54,
    en: {
      question: 'How do I get a taxi?',
      answer: 'Ask the Guest Care Center beside the lobby to call one. There is a rank at Lützowplatz.',
    },
    de: {
      question: 'Wie bekomme ich ein Taxi?',
      answer:
        'Das Guest Care Center neben der Lobby ruft eins. Halteplatz am Lützowplatz.',
    },
  },
  {
    slug: 'guest-jogging',
    category: 'getting-around',
    order: 55,
    en: {
      question: 'Where can I go for a run?',
      answer: 'Tiergarten is the closest loop. Guest Care can point you to the canal paths as well.',
    },
    de: {
      question: 'Wo kann ich joggen?',
      answer: 'Am nächsten ist der Tiergarten. Guest Care zeigt dir auch die Kanalrunden.',
    },
  },

  // —— Haus & Regeln ——
  {
    slug: 'guest-dogs',
    category: 'house-rules',
    order: 60,
    en: {
      question: 'Are dogs allowed?',
      answer: 'Yes. Dogs are €30 per day.',
    },
    de: {
      question: 'Sind Hunde erlaubt?',
      answer: 'Ja. Hunde kosten 30 €/Tag.',
    },
  },
  {
    slug: 'guest-nonsmoking',
    category: 'house-rules',
    order: 61,
    en: {
      question: 'Can I smoke in the hotel?',
      answer:
        'No. This is a non-smoking hotel. Smoking in the room incurs a €250 cleaning fee.',
    },
    de: {
      question: 'Darf ich im Hotel rauchen?',
      answer:
        'Nein. Das Haus ist ein Nichtraucherhotel. Rauchen im Zimmer kostet 250 € Reinigungsgebühr.',
    },
  },
  {
    slug: 'guest-gym',
    category: 'house-rules',
    order: 62,
    en: {
      question: 'When is the gym open?',
      answer: 'The gym is open 24/7 for hotel guests.',
    },
    de: {
      question: 'Wann hat das Gym auf?',
      answer: 'Das Gym ist 24/7 für Hotelgäste offen.',
    },
  },
  {
    slug: 'guest-sauna',
    category: 'house-rules',
    order: 63,
    en: {
      question: 'How do I use the sauna?',
      answer: 'The sauna is on request, with 45 minutes’ notice. Ask Guest Care to book a slot.',
    },
    de: {
      question: 'Wie nutze ich die Sauna?',
      answer:
        'Die Sauna ist auf Anfrage, 45 Minuten Vorlauf. Ein Slot läuft über das Guest Care Center.',
    },
  },
  {
    slug: 'guest-business-center',
    category: 'house-rules',
    order: 64,
    en: {
      question: 'Where is the business center?',
      answer: 'The business center is in the lobby.',
    },
    de: {
      question: 'Wo ist das Business Center?',
      answer: 'Das Business Center ist in der Lobby.',
    },
  },
  {
    slug: 'guest-care-center',
    category: 'house-rules',
    order: 65,
    en: {
      question: 'Where is Guest Care?',
      answer: 'The Guest Care Center is beside the lobby and open 24/7.',
    },
    de: {
      question: 'Wo ist das Guest Care Center?',
      answer: 'Das Guest Care Center ist 24/7 neben der Lobby.',
    },
  },
  {
    slug: 'guest-room-service',
    category: 'house-rules',
    order: 66,
    en: {
      question: 'Is there room service?',
      answer: 'No room service — collect food and drinks at the bar.',
    },
    de: {
      question: 'Gibt es Zimmerservice?',
      answer: 'Kein Zimmerservice — Abholung an der Bar.',
    },
  },

  // —— Essen & Trinken ——
  {
    slug: 'guest-breakfast',
    category: 'dining',
    order: 70,
    en: {
      question: 'When is breakfast, and what does it cost?',
      answer:
        'Breakfast is 06:30–10:00, Saturday and Sunday until 11:00. €23 for adults, €12 from age 6.',
    },
    de: {
      question: 'Wann ist Frühstück, und was kostet es?',
      answer:
        'Frühstück 06:30–10:00, Sa/So bis 11:00. 23 € Erwachsene, 12 € ab 6 Jahren.',
    },
  },
  {
    slug: 'guest-lutze-hours',
    category: 'dining',
    order: 71,
    en: {
      question: 'When is Lütze open?',
      answer: 'Lütze is open 10:00–01:00.',
    },
    de: {
      question: 'Wann hat Lütze auf?',
      answer: 'Lütze hat von 10:00–01:00 auf.',
    },
  },
  {
    slug: 'guest-wundermart',
    category: 'dining',
    order: 72,
    en: {
      question: 'When is Wundermart open?',
      answer: 'Wundermart is 24/7 in the lobby. Card payment only.',
    },
    de: {
      question: 'Wann hat der Wundermart auf?',
      answer: 'Wundermart ist 24/7 in der Lobby. Zahlung nur mit Karte.',
    },
  },
  {
    slug: 'guest-dining-card-only',
    category: 'dining',
    order: 73,
    en: {
      question: 'Can I pay cash at Lütze or breakfast?',
      answer: 'No. Food and drink in the hotel is card only — no cash.',
    },
    de: {
      question: 'Kann ich in Lütze oder beim Frühstück bar zahlen?',
      answer: 'Nein. Essen & Trinken im Haus nur mit Karte — kein Bargeld.',
    },
  },
]
