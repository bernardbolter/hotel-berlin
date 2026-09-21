import 'dotenv/config'
import './guard'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { getPayload } from 'payload'

import config from '../payload.config'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const heroDir = path.resolve(dirname, 'assets/meet-and-work/hero')
const teasersDir = path.resolve(dirname, 'assets/meet-and-work/teasers')

const force =
  process.argv.includes('--force') || process.env.MEETINGS_GLOBAL_SEED_FORCE === '1'

const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i

const teaserFiles = {
  hybrid: path.join(teasersDir, 'hybrid.jpg'),
  foodDrink: path.join(teasersDir, 'food-drink.jpg'),
} as const

const teaserAlts = {
  hybrid: {
    en: 'Hybrid meeting setup at Hotel Berlin, Berlin',
    de: 'Hybrid-Meeting Setup im Hotel Berlin, Berlin',
  },
  foodDrink: {
    en: 'Catering and banquet at Hotel Berlin, Berlin',
    de: 'Catering und Bankett im Hotel Berlin, Berlin',
  },
} as const


const eventFormatsDir = path.resolve(dirname, 'assets/meet-and-work/event-formats')

const eventFormatDefs = [
  {
    key: 'meetings',
    lucideIcon: 'Users',
    en: {
      label: 'Meetings',
      description:
        'Big business, small business, day-long conferences or a short meeting? On more than 3,000 m² of event space we give everything to make your event successful.',
    },
    de: {
      label: 'Tagungen',
      description:
        'Big Business, Small Business, tagelange Konferenzen oder ein kurzes Meeting? Auf über 3.000 m² Veranstaltungsfläche geben wir alles, um Ihre Veranstaltung erfolgreich zu machen.',
    },
  },
  {
    key: 'conferences',
    lucideIcon: 'Presentation',
    en: {
      label: 'Conferences',
      description:
        'Your success is our agenda! The flexibility of the hotel, clear unobtrusive interior design, modern technology and years of experience make it possible to run events to extraordinary customer wishes.',
    },
    de: {
      label: 'Konferenzen',
      description:
        'Ihr Erfolg ist unsere Agenda! Die besonders große Flexibilität des Hauses, die klare unaufdringliche Innenarchitektur, modernste Technik und jahrelange Erfahrung ermöglichen es, Veranstaltungen nach außergewöhnlichen Kundenwünschen durchzuführen.',
    },
  },
  {
    key: 'fairs',
    lucideIcon: 'Store',
    en: {
      label: 'Fairs',
      description:
        'Trade shows are ideal for meeting people on a casual level, having interesting conversations and networking. Build personal relationships, present your products and win potential customers — we keep you organisationally free and take care of everything a successful fair needs.',
    },
    de: {
      label: 'Messen',
      description:
        'Messen sind ideal, um Menschen auf einer ungezwungenen Ebene kennenzulernen, interessante Gespräche zu führen und zu netzwerken. Hier haben Sie die Möglichkeit, persönliche Beziehungen aufzubauen, Ihre Produkte zu präsentieren und potenzielle Kunden zu gewinnen. Wir halten Ihnen organisatorisch den Rücken frei und kümmern uns um alles, was zu einer erfolgreichen Messe gehört.',
    },
  },
  {
    key: 'exhibitions',
    lucideIcon: 'Frame',
    en: {
      label: 'Exhibitions',
      description:
        'We set the scene for you! With technology, catering and style, we create the perfect setting for exhibitions, debates, coaching sessions and briefings. And that is not an exaggerated luxury, but our standard.',
    },
    de: {
      label: 'Ausstellungen',
      description:
        'Wir setzen Sie in Szene! Mit Technik, Catering und Stil bilden wir den perfekten Rahmen für Ausstellungen, Debatten, Coachings und Briefings. Und das ist kein übertriebener Luxus, sondern unser Standard.',
    },
  },
] as const

function findEventFormatImage(key: string): string | null {
  if (!fs.existsSync(eventFormatsDir)) return null
  const match = fs
    .readdirSync(eventFormatsDir)
    .find((name) => IMAGE_EXT.test(name) && path.parse(name).name.toLowerCase() === key)
  return match ? path.join(eventFormatsDir, match) : null
}

const facilitiesEn = [
  {
    label: 'Light flooded rooms',
    description: 'All our rooms are light flooded (except room Berlin-Berlin).',
    lucideIcon: 'Sun',
  },
  {
    label: 'Air-conditioned',
    description: 'All meeting rooms are air-conditioned.',
    lucideIcon: 'Wind',
  },
  {
    label: 'Adjustable light',
    description: 'Adjustable light in all meeting rooms.',
    lucideIcon: 'Lightbulb',
  },
  {
    label: 'Meeting rooms can be darkened',
    description: 'Mostly all meeting rooms can be darkened.',
    lucideIcon: 'Moon',
  },
  {
    label: 'State-of-the-art technical equipment',
    description:
      'State-of-the-art audio, video and lighting technology, CAT-7, multi-touch displays & projectors with 3 × 20,000 lumens.',
    lucideIcon: 'Monitor',
  },
  {
    label: 'Professional technical partner',
    description:
      'Kuchem Konferenz Technik is our competent and reliable partner for conference, interpreting and event technology.',
    lucideIcon: 'Headset',
  },
  {
    label: 'Spacious foyers',
    description:
      'Spacious foyers provide generous space for networking sessions and are ideal for coffee breaks.',
    lucideIcon: 'Columns2',
  },
  {
    label: 'Electronic room signage',
    description: 'Customizable electronic room signage with branding opportunities.',
    lucideIcon: 'Tablet',
  },
  {
    label: 'Combinable meeting rooms',
    description: 'Combinable meeting rooms for customized events.',
    lucideIcon: 'Combine',
  },
  {
    label: 'Multiple branding options',
    description:
      'At the centre of any successful event there’s always a story — your story! We offer various options for effective and peerless event branding to make sure that your story is unforgettable.',
    lucideIcon: 'Sparkles',
  },
]

const facilitiesDe = [
  {
    label: 'Lichtdurchfluteter Raum',
    description: 'All unsere Konferenzräume mit Tageslicht (ausgenommen Berlin-Berlin).',
    lucideIcon: 'Sun',
  },
  {
    label: 'Klimatisiert',
    description: 'Alle Veranstaltungsräume sind klimatisiert.',
    lucideIcon: 'Wind',
  },
  {
    label: 'Regelbares Licht',
    description: 'Regelbares Licht in allen Veranstaltungsräumen.',
    lucideIcon: 'Lightbulb',
  },
  {
    label: 'Veranstaltungsraum abdunkelbar',
    description: 'Nahezu alle Veranstaltungsräume sind abdunkelbar.',
    lucideIcon: 'Moon',
  },
  {
    label: 'Modernste technische Ausstattung',
    description:
      'Modernste Audio-, Video- und Lichttechnik, CAT-7, Multi-Touch-Displays & Projektoren mit 3 × 20.000 Lumen.',
    lucideIcon: 'Monitor',
  },
  {
    label: 'Professioneller technischer Partner',
    description:
      'Kuchem Konferenz Technik ist unser kompetenter und zuverlässiger Partner für Konferenz-, Dolmetscher- und Veranstaltungstechnik.',
    lucideIcon: 'Headset',
  },
  {
    label: 'Großzügige Foyers',
    description:
      'Großzügige Foyers bieten ausreichend Platz für Networking und sind ideal für Kaffeepausen.',
    lucideIcon: 'Columns2',
  },
  {
    label: 'Digitale Raumausschilderung',
    description: 'Anpassbare digitale Raumbeschilderung mit Branding-Möglichkeiten.',
    lucideIcon: 'Tablet',
  },
  {
    label: 'Kombinierbare Veranstaltungsräume',
    description: 'Kombinierbare Veranstaltungsräume für maßgeschneiderte Events.',
    lucideIcon: 'Combine',
  },
  {
    label: 'Vielfältige Möglichkeiten des eigenen Brandings',
    description:
      'Im Mittelpunkt jeder erfolgreichen Veranstaltung steht immer eine Geschichte — Ihre Geschichte! Wir bieten verschiedene Möglichkeiten für effektives und unvergleichliches Event-Branding, damit Ihre Geschichte unvergesslich wird.',
    lucideIcon: 'Sparkles',
  },
]

const heroAlts = {
  en: [
    'Meeting room at Hotel Berlin, Berlin — hero 1',
    'Meeting room at Hotel Berlin, Berlin — hero 2',
    'Meeting room at Hotel Berlin, Berlin — hero 3',
    'Meeting room at Hotel Berlin, Berlin — hero 4',
  ],
  de: [
    'Meetingraum im Hotel Berlin, Berlin — Hero 1',
    'Meetingraum im Hotel Berlin, Berlin — Hero 2',
    'Meetingraum im Hotel Berlin, Berlin — Hero 3',
    'Meetingraum im Hotel Berlin, Berlin — Hero 4',
  ],
} as const

async function uploadOrReuse(
  payload: Awaited<ReturnType<typeof getPayload>>,
  filePath: string,
  alt: string,
) {
  const filename = path.basename(filePath)
  const existing = (
    await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
    })
  ).docs[0]

  if (existing && !force) {
    console.log(`Reusing media: ${filename} (id ${existing.id})`)
    return existing
  }

  const media = await payload.create({
    collection: 'media',
    data: { alt },
    filePath,
  })
  console.log(`Uploaded media: ${filename} (id ${media.id})`)
  return media
}

async function seedMeetingsGlobal() {
  const payload = await getPayload({ config })

  if (!fs.existsSync(heroDir)) {
    console.error(`Missing hero assets folder:\n  ${heroDir}`)
    process.exit(1)
  }

  const files = fs
    .readdirSync(heroDir)
    .filter((name) => IMAGE_EXT.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  if (files.length === 0) {
    console.error(`No images in ${heroDir}`)
    process.exit(1)
  }

  console.log(`Uploading ${files.length} hero slide(s)…`)
  const slideIds: number[] = []
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!
    const alt = heroAlts.en[i] ?? path.parse(file).name
    const media = await uploadOrReuse(payload, path.join(heroDir, file), alt)
    slideIds.push(media.id as number)
  }

  let hybridImageId: number | undefined
  let foodDrinkImageId: number | undefined

  if (fs.existsSync(teaserFiles.hybrid)) {
    console.log('Uploading hybrid teaser image…')
    const media = await uploadOrReuse(payload, teaserFiles.hybrid, teaserAlts.hybrid.en)
    hybridImageId = media.id as number
  } else {
    console.warn(`Missing hybrid teaser: ${teaserFiles.hybrid}`)
  }

  if (fs.existsSync(teaserFiles.foodDrink)) {
    console.log('Uploading food & drink teaser image…')
    const media = await uploadOrReuse(payload, teaserFiles.foodDrink, teaserAlts.foodDrink.en)
    foodDrinkImageId = media.id as number
  } else {
    console.warn(`Missing food & drink teaser: ${teaserFiles.foodDrink}`)
  }

  console.log('Uploading event format images (if present)…')
  const eventFormatImageIds: Record<string, number> = {}
  for (const format of eventFormatDefs) {
    const filePath = findEventFormatImage(format.key)
    if (!filePath) {
      console.warn(`No image yet for event format "${format.key}" in ${eventFormatsDir}`)
      continue
    }
    const media = await uploadOrReuse(
      payload,
      filePath,
      `${format.en.label} at Hotel Berlin, Berlin`,
    )
    eventFormatImageIds[format.key] = media.id as number
  }

  const eventTypesShared = eventFormatDefs.map((format) => ({
    key: format.key,
    lucideIcon: format.lucideIcon,
    ...(eventFormatImageIds[format.key] ? { image: eventFormatImageIds[format.key] } : {}),
  }))

  // Default locale first so array rows get stable IDs, then patch EN on the same rows.
  console.log('Seeding meetings global (DE — default locale)…')
  await payload.updateGlobal({
    slug: 'meetings',
    locale: 'de',
    data: {
      heroKicker: '',
      heroHeadline: 'Wir kümmern uns um Ihr Business',
      heroIntro:
        'Auf der Suche nach Superlativen sind Sie bei uns in Berlins Mitte angekommen! Aber wir tragen Titel wie „Top 1 Independent Meeting Hotel in Europa“ oder die Nachhaltigkeitszertifikate „BREEAM“ & „Green Key“ mit hauptstädtischem Understatement. Denn die besten Events und Konferenzen auszurichten, – mit erstklassigem Catering, tollen Räumen, hypermoderner Technik und Top-Anbindung – ist für uns easy. Deshalb legen wir zuverlässig immer noch was drauf, um Ihre Veranstaltung wirklich ganz und gar zu Ihrem Erfolg zu machen.',
      heroContactLabel: 'Kontaktieren Sie uns:',
      heroSlides: slideIds.map((id, i) => ({
        image: id,
        alt: heroAlts.de[i] ?? `Meetingraum Hero ${i + 1}`,
      })),
      contactPhone: '+49 30 2605 2602',
      contactEmail: 'conference@hotel-berlin.de',
      eventTypesHeading: 'Event-Formate',
      eventTypes: eventFormatDefs.map((format, i) => ({
        ...eventTypesShared[i],
        label: format.de.label,
        description: format.de.description,
      })),
      facilities: facilitiesDe,
      closingHeadline: 'Bereit für dein nächstes Meeting?',
      closingCtaLabel: 'Anfrage senden',
      hybridTeaser: {
        kicker: 'Hybride Meetings',
        headline: 'Digitale Konferenzen & Streaming',
        body: 'Wir zeigen Ihnen die technischen Möglichkeiten, helfen Ihnen, das richtige Format für Ihre Veranstaltung auszuwählen und beraten Sie, was hierbei zu beachten ist. Die Kombination aus professionell ausgestatteten Arbeitsräumen und HangOut-Areas bietet ideale Voraussetzungen für Konferenzen und kreative Meetings, für Workshops und Besprechungen.',
        ctaLabel: 'Zum Factsheet',
        ...(hybridImageId ? { image: hybridImageId } : {}),
      },
      foodDrinkTeaser: {
        kicker: 'Essen & Getränke',
        headline: 'Meet & Eat',
        body: 'Egal, ob Sie ein Meeting mit zehn oder eine Konferenz mit 1.000 Teilnehmern planen, unser erfahrenes Personal steht Ihnen bei der Auswahl Ihres ganz persönlichen Menüs gern beratend zur Seite. Denn das Essen soll für Sie in unserem Haus mehr sein als nur eine Stärkung für den Tag — und vor allem ein Genuss.',
        ctaLabel: 'Zur Bankettmappe',
        ...(foodDrinkImageId ? { image: foodDrinkImageId } : {}),
      },
    },
  })

  const deDoc = await payload.findGlobal({
    slug: 'meetings',
    locale: 'de',
    depth: 0,
    fallbackLocale: false,
  })

  const deEventRows = deDoc.eventTypes ?? []
  const deFacilityRows = deDoc.facilities ?? []

  console.log('Seeding meetings global (EN — same array row IDs)…')
  await payload.updateGlobal({
    slug: 'meetings',
    locale: 'en',
    data: {
      heroKicker: 'Award-winning business hotel in Berlin',
      heroHeadline: 'We take care of your business',
      heroIntro:
        'If you\'re looking for superlatives, then you\'ve landed at the right place! But we\'re actually very modest about being voted "Top 1 Independent Meeting Hotel in Europe" and our "BREEAM" & "Green Key" certificates. Organizing the best events and conferences — with first-class catering, great Berlin meeting rooms and state-of-the-art technology — comes easy to us. Which is why the team at our business hotel in Berlin always puts in extra effort to make sure that your event is a splendid success!',
      heroContactLabel: 'Contact us:',
      heroSlides: slideIds.map((id, i) => ({
        image: id,
        alt: heroAlts.en[i] ?? `Meeting room hero ${i + 1}`,
      })),
      eventTypesHeading: 'Event formats',
      eventTypes: eventFormatDefs.map((format, i) => ({
        id: deEventRows[i]?.id,
        ...eventTypesShared[i],
        label: format.en.label,
        description: format.en.description,
      })),
      facilities: facilitiesEn.map((item, i) => ({
        id: deFacilityRows[i]?.id,
        ...item,
      })),
      closingHeadline: 'Ready to plan your next meeting?',
      closingCtaLabel: 'Request a quote',
      hybridTeaser: {
        kicker: 'Virtual Meetings',
        headline: 'Digital meetings & streaming solutions',
        body: 'Let us show you our technical possibilities and help you choose the right event format for the circumstances. Our combination of professionally equipped work areas and hangout spots offers the perfect conditions for conferences, meetings and creative workshops of all kinds.',
        ctaLabel: 'To the factsheet',
        ...(hybridImageId ? { image: hybridImageId } : {}),
      },
      foodDrinkTeaser: {
        kicker: 'Food & Beverages',
        headline: 'Meet & Eat',
        body: 'Whether you are planning a meeting with ten or a conference with 1,000 participants, our experienced staff will be happy to advise you on your menu. After all, food should be more than just a meal to strengthen you for the day — and above all, a pleasure.',
        ctaLabel: 'To the banquet folder',
        ...(foodDrinkImageId ? { image: foodDrinkImageId } : {}),
      },
    },
  })

  console.log(
    `Done — ${slideIds.length} hero slide(s)` +
      `${hybridImageId ? ', hybrid image' : ''}` +
      `${foodDrinkImageId ? ', food-drink image' : ''}` +
      `, ${Object.keys(eventFormatImageIds).length}/${eventFormatDefs.length} format image(s)` +
      ' + editorial copy.',
  )
  process.exit(0)
}

seedMeetingsGlobal().catch((err) => {
  console.error(err)
  process.exit(1)
})
