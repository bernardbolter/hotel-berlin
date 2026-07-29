/**
 * Align DB for neighbourhood/people schema without interactive drizzle push.
 * Safe to re-run (IF NOT EXISTS). Used on production/test where
 * PAYLOAD_DATABASE_PUSH is false.
 */
import 'dotenv/config'
import pg from 'pg'

const sql = `
-- Enums
DO $$ BEGIN CREATE TYPE enum_people_type AS ENUM ('artist','curator','host','partner','staff','local'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_people_status AS ENUM ('draft','published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_people_authority_identifier_property_i_d AS ENUM ('Wikidata','GND','VIAF','GoogleKG'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_neighbourhood_places_category AS ENUM ('Art','Bar','Kids','Museum','Parks and Nature','Party','Restaurant','Shopping','Sightseeing'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_neighbourhood_places_schema_type AS ENUM ('TouristAttraction','LocalBusiness','Museum','Park','Restaurant','BarOrPub','ShoppingCenter'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_neighbourhood_places_distance_tier AS ENUM ('walkable','short-transit','further-out'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_neighbourhood_places_indoor_outdoor AS ENUM ('indoor','outdoor','both'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_neighbourhood_places_status AS ENUM ('active','inactive'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE enum_neighbourhood_places_authority_identifier_property_i_d AS ENUM ('Wikidata','GND','GoogleKG','GooglePlaceID'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- people scalar columns
ALTER TABLE people ADD COLUMN IF NOT EXISTS job_title varchar;
ALTER TABLE people ADD COLUMN IF NOT EXISTS quote varchar;
ALTER TABLE people ADD COLUMN IF NOT EXISTS video varchar;
ALTER TABLE people ADD COLUMN IF NOT EXISTS room_number varchar;
ALTER TABLE people ADD COLUMN IF NOT EXISTS based_in varchar;
ALTER TABLE people ADD COLUMN IF NOT EXISTS related_venue_id integer;

-- type / status as proper enums (upgrade varchar columns if the first align pass created them)
DO $$ BEGIN
  ALTER TABLE people ADD COLUMN type enum_people_type;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE people ADD COLUMN status enum_people_status;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- If type/status were added earlier as varchar, convert them
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'people' AND column_name = 'type' AND data_type = 'character varying'
  ) THEN
    ALTER TABLE people ALTER COLUMN type TYPE enum_people_type USING type::enum_people_type;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'people' AND column_name = 'status' AND data_type = 'character varying'
  ) THEN
    ALTER TABLE people ALTER COLUMN status TYPE enum_people_status USING status::enum_people_status;
  END IF;
END $$;

-- Legacy stub columns → new fields
DO $$ BEGIN
  UPDATE people SET job_title = role WHERE job_title IS NULL AND role IS NOT NULL;
EXCEPTION WHEN undefined_column THEN NULL;
END $$;
ALTER TABLE people DROP COLUMN IF EXISTS role;
ALTER TABLE people DROP COLUMN IF EXISTS is_insider;
UPDATE people SET status = 'draft' WHERE status IS NULL;

-- people authority arrays
CREATE TABLE IF NOT EXISTS people_authority_identifier (
  _order integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  property_i_d enum_people_authority_identifier_property_i_d NOT NULL,
  value varchar NOT NULL
);
CREATE INDEX IF NOT EXISTS people_authority_identifier_order_idx ON people_authority_identifier USING btree (_order);
CREATE INDEX IF NOT EXISTS people_authority_identifier_parent_id_idx ON people_authority_identifier USING btree (_parent_id);

CREATE TABLE IF NOT EXISTS people_authority_same_as (
  _order integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  url varchar NOT NULL
);
CREATE INDEX IF NOT EXISTS people_authority_same_as_order_idx ON people_authority_same_as USING btree (_order);
CREATE INDEX IF NOT EXISTS people_authority_same_as_parent_id_idx ON people_authority_same_as USING btree (_parent_id);

-- neighbourhood places
CREATE TABLE IF NOT EXISTS neighbourhood_places (
  id serial PRIMARY KEY,
  name varchar NOT NULL,
  slug varchar NOT NULL,
  category enum_neighbourhood_places_category NOT NULL,
  schema_type enum_neighbourhood_places_schema_type NOT NULL,
  address_street_address varchar,
  address_address_locality varchar,
  address_postal_code varchar,
  geo_latitude numeric,
  geo_longitude numeric,
  walking_minutes numeric,
  distance_tier enum_neighbourhood_places_distance_tier,
  indoor_outdoor enum_neighbourhood_places_indoor_outdoor,
  website varchar,
  opening_hours varchar,
  price_range varchar,
  image_id integer,
  status enum_neighbourhood_places_status DEFAULT 'active' NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS neighbourhood_places_slug_idx ON neighbourhood_places USING btree (slug);

CREATE TABLE IF NOT EXISTS neighbourhood_places_locales (
  description varchar,
  id serial PRIMARY KEY,
  _locale _locales NOT NULL,
  _parent_id integer NOT NULL REFERENCES neighbourhood_places(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS neighbourhood_places_locales_locale_parent_id_unique
  ON neighbourhood_places_locales USING btree (_locale, _parent_id);

CREATE TABLE IF NOT EXISTS neighbourhood_places_endorsements (
  _order integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES neighbourhood_places(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  person_id integer REFERENCES people(id) ON DELETE SET NULL,
  quote varchar NOT NULL,
  associated_room varchar
);
CREATE INDEX IF NOT EXISTS neighbourhood_places_endorsements_order_idx ON neighbourhood_places_endorsements USING btree (_order);
CREATE INDEX IF NOT EXISTS neighbourhood_places_endorsements_parent_id_idx ON neighbourhood_places_endorsements USING btree (_parent_id);
CREATE INDEX IF NOT EXISTS neighbourhood_places_endorsements_person_idx ON neighbourhood_places_endorsements USING btree (person_id);

CREATE TABLE IF NOT EXISTS neighbourhood_places_target_audience (
  _order integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES neighbourhood_places(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  label varchar
);
CREATE INDEX IF NOT EXISTS neighbourhood_places_target_audience_order_idx ON neighbourhood_places_target_audience USING btree (_order);
CREATE INDEX IF NOT EXISTS neighbourhood_places_target_audience_parent_id_idx ON neighbourhood_places_target_audience USING btree (_parent_id);

CREATE TABLE IF NOT EXISTS neighbourhood_places_authority_identifier (
  _order integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES neighbourhood_places(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  property_i_d enum_neighbourhood_places_authority_identifier_property_i_d NOT NULL,
  value varchar NOT NULL
);
CREATE INDEX IF NOT EXISTS neighbourhood_places_authority_identifier_order_idx ON neighbourhood_places_authority_identifier USING btree (_order);
CREATE INDEX IF NOT EXISTS neighbourhood_places_authority_identifier_parent_id_idx ON neighbourhood_places_authority_identifier USING btree (_parent_id);

CREATE TABLE IF NOT EXISTS neighbourhood_places_authority_same_as (
  _order integer NOT NULL,
  _parent_id integer NOT NULL REFERENCES neighbourhood_places(id) ON DELETE CASCADE,
  id varchar PRIMARY KEY,
  url varchar NOT NULL
);
CREATE INDEX IF NOT EXISTS neighbourhood_places_authority_same_as_order_idx ON neighbourhood_places_authority_same_as USING btree (_order);
CREATE INDEX IF NOT EXISTS neighbourhood_places_authority_same_as_parent_id_idx ON neighbourhood_places_authority_same_as USING btree (_parent_id);

-- Ensure endorsements.associated_room exists if table predated the schema fix
ALTER TABLE neighbourhood_places_endorsements ADD COLUMN IF NOT EXISTS associated_room varchar;
ALTER TABLE neighbourhood_places DROP COLUMN IF EXISTS associated_room;
`

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL missing')

  const client = new pg.Client({ connectionString: url })
  await client.connect()
  try {
    await client.query(sql)
    console.log('Neighbourhood / people schema aligned.')
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
