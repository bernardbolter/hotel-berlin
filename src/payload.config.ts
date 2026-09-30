import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { de } from '@payloadcms/translations/languages/de'
import { en } from '@payloadcms/translations/languages/en'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { publicMediaUrl, r2Configured, r2Endpoint } from './lib/media/r2'
import { MEDIA_MAX_FILE_SIZE } from './lib/media/limits'

import { Amenities } from './collections/Amenities'
import { Artists } from './collections/Artists'
import { Artworks } from './collections/Artworks'
import { Events } from './collections/Events'
import { Exhibitions } from './collections/Exhibitions'
import { FAQs } from './collections/FAQs'
import { HeroSlides } from './collections/HeroSlides'
import { Pages } from './collections/Pages'
import { LegalDocuments } from './collections/LegalDocuments'
import { Media } from './collections/Media'
import { MeetingDocuments } from './collections/MeetingDocuments'
import { MeetingInquiries } from './collections/MeetingInquiries'
import { MeetingRooms } from './collections/MeetingRooms'
import { NeighbourhoodPlaces } from './collections/NeighbourhoodPlaces'
import { People } from './collections/People'
import { Places } from './collections/Places'
import { Rooms } from './collections/Rooms'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { Venues } from './collections/Venues'
import { Footer } from './globals/Footer'
import { Hotel } from './globals/Hotel'
import { Homepage } from './globals/Homepage'
import { Meetings } from './globals/Meetings'
import { Navigation } from './globals/Navigation'
import { migrations } from './migrations'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      actions: ['/components/admin/AdminLanguageSwitcher#AdminLanguageSwitcher'],
      beforeDashboard: ['/components/admin/NeuesWerkButton#NeuesWerkDashboardButton'],
      views: {
        neuesWerk: {
          Component: '/components/admin/NeuesWerkView#NeuesWerkView',
          path: '/neues-werk',
          meta: {
            title: 'Neues Werk',
            description: 'Geführte Eingabe für Kunstwerke im Haus',
          },
        },
        standorte: {
          Component: '/components/admin/StandorteView#StandorteView',
          path: '/standorte',
          meta: {
            title: 'Standorte',
            description: 'Außenwerke ohne Koordinaten nachtragen',
          },
        },
      },
    },
  },
  i18n: {
    fallbackLanguage: 'de',
    supportedLanguages: { de, en },
  },
  collections: [
    Users,
    Media,
    Tags,
    Rooms,
    MeetingRooms,
    MeetingDocuments,
    MeetingInquiries,
    Venues,
    HeroSlides,
    Amenities,
    FAQs,
    Artists,
    Artworks,
    Exhibitions,
    Events,
    People,
    NeighbourhoodPlaces,
    Places,
    Pages,
    LegalDocuments,
  ],
  globals: [Hotel, Homepage, Navigation, Footer, Meetings],
  editor: lexicalEditor(),
  localization: {
    locales: ['de', 'en'],
    defaultLocale: 'de',
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Schema changes ship as migrations (`npm run migrate:create` then `npm run migrate`).
    // Push is hard-off in production. Elsewhere it stays off unless PAYLOAD_DATABASE_PUSH=true.
    push:
      process.env.NODE_ENV !== 'production' &&
      process.env.PAYLOAD_DATABASE_PUSH === 'true',
    migrationDir: path.resolve(dirname, 'migrations'),
    prodMigrations: migrations,
  }),
  sharp,
  upload: {
    limits: {
      fileSize: MEDIA_MAX_FILE_SIZE,
    },
    abortOnLimit: true,
    responseOnLimit: `File too large. Maximum size is ${MEDIA_MAX_FILE_SIZE / (1024 * 1024)} MB.`,
  },
  plugins: [
    s3Storage({
      // Unset R2 credentials keep files on local disk (dev).
      enabled: r2Configured(),
      collections: {
        media: {
          generateFileURL: ({ filename, prefix }) => publicMediaUrl(filename, prefix) || '',
        },
      },
      bucket: process.env.R2_BUCKET || '',
      clientUploads: true,
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: 'auto',
        endpoint: r2Endpoint(),
        forcePathStyle: true,
      },
    }),
  ],
})
