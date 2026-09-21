import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

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

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
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
    Amenities,
    HeroSlides,
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
    // Local `next dev` only: Drizzle push. Tests, build, and production use migrations.
    // Off unless PAYLOAD_DATABASE_PUSH=true (see doc/dev/DATABASE.md).
    push: process.env.PAYLOAD_DATABASE_PUSH === 'true',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    vercelBlobStorage({
      // Unset token keeps files on local disk (dev). Production must set BLOB_READ_WRITE_TOKEN.
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true,
    }),
  ],
})
