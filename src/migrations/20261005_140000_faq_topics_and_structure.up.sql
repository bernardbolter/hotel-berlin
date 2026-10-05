-- Enums

DO $$ BEGIN
  CREATE TYPE "public"."enum__faqs_v_published_locale" AS ENUM('de', 'en');
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum__faqs_v_version_audience" AS ENUM('prospect', 'guest', 'both');
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum__faqs_v_version_category" AS ENUM('rooms-booking', 'checkin-checkout', 'dining', 'meetings', 'accessibility', 'getting-here', 'pets-parking', 'general', 'wifi-tech', 'guest-services', 'neighbourhood-guest', 'arrival-departure', 'in-room', 'money-payment', 'health-emergency', 'getting-around', 'house-rules');
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum__faqs_v_version_context" AS ENUM('prospect', 'guest');
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum__faqs_v_version_pinned_routes" AS ENUM('home', 'rooms', 'room-detail', 'meetings', 'amenities', 'sustainability', 'offers', 'contact', 'faq', 'here', 'here-dining', 'here-getting-around', 'here-faq', 'policy-checkin', 'policy-cancellation', 'policy-pets', 'policy-fees', 'policy-payment');
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum__faqs_v_version_priority" AS ENUM('1', '2', '3');
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum__faqs_v_version_source" AS ENUM('chatbot', 'website', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum__faqs_v_version_status" AS ENUM('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum_faqs_audience" AS ENUM('prospect', 'guest', 'both');
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum_faqs_pinned_routes" AS ENUM('home', 'rooms', 'room-detail', 'meetings', 'amenities', 'sustainability', 'offers', 'contact', 'faq', 'here', 'here-dining', 'here-getting-around', 'here-faq', 'policy-checkin', 'policy-cancellation', 'policy-pets', 'policy-fees', 'policy-payment');
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum_faqs_priority" AS ENUM('1', '2', '3');
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum_faqs_source" AS ENUM('chatbot', 'website', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "public"."enum_faqs_status" AS ENUM('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

-- New tables (faq-topics, arrays, versions)



CREATE TABLE IF NOT EXISTS public._faqs_v (
    id integer NOT NULL,
    parent_id integer,
    version_context public.enum__faqs_v_version_context,
    version_audience public.enum__faqs_v_version_audience,
    version_category public.enum__faqs_v_version_category,
    version_topic_id integer,
    version_priority public.enum__faqs_v_version_priority,
    version_merged_into_id integer,
    version_order numeric DEFAULT 0,
    version_slug character varying,
    version_internal_note character varying,
    version_source public.enum__faqs_v_version_source,
    version_last_reviewed timestamp(3) with time zone,
    version_updated_at timestamp(3) with time zone,
    version_created_at timestamp(3) with time zone,
    version__status public.enum__faqs_v_version_status DEFAULT 'draft'::public.enum__faqs_v_version_status,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    snapshot boolean,
    published_locale public.enum__faqs_v_published_locale,
    latest boolean
);

CREATE SEQUENCE IF NOT EXISTS public._faqs_v_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public._faqs_v_id_seq OWNED BY public._faqs_v.id;

CREATE TABLE IF NOT EXISTS public._faqs_v_locales (
    version_question character varying,
    version_answer character varying,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);

CREATE SEQUENCE IF NOT EXISTS public._faqs_v_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public._faqs_v_locales_id_seq OWNED BY public._faqs_v_locales.id;

CREATE TABLE IF NOT EXISTS public._faqs_v_rels (
    id integer NOT NULL,
    "order" integer,
    parent_id integer NOT NULL,
    path character varying NOT NULL,
    faq_topics_id integer,
    rooms_id integer,
    meeting_rooms_id integer,
    venues_id integer,
    pages_id integer
);

CREATE SEQUENCE IF NOT EXISTS public._faqs_v_rels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public._faqs_v_rels_id_seq OWNED BY public._faqs_v_rels.id;

CREATE TABLE IF NOT EXISTS public._faqs_v_version_alias_slugs (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id integer NOT NULL,
    slug character varying,
    _uuid character varying
);

CREATE SEQUENCE IF NOT EXISTS public._faqs_v_version_alias_slugs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public._faqs_v_version_alias_slugs_id_seq OWNED BY public._faqs_v_version_alias_slugs.id;

CREATE TABLE IF NOT EXISTS public._faqs_v_version_pinned_routes (
    "order" integer NOT NULL,
    parent_id integer NOT NULL,
    value public.enum__faqs_v_version_pinned_routes,
    id integer NOT NULL
);

CREATE SEQUENCE IF NOT EXISTS public._faqs_v_version_pinned_routes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public._faqs_v_version_pinned_routes_id_seq OWNED BY public._faqs_v_version_pinned_routes.id;

CREATE TABLE IF NOT EXISTS public.faq_topics (
    id integer NOT NULL,
    slug character varying NOT NULL,
    sort_order numeric DEFAULT 0 NOT NULL,
    updated_at timestamp(3) with time zone DEFAULT now() NOT NULL,
    created_at timestamp(3) with time zone DEFAULT now() NOT NULL
);

CREATE SEQUENCE IF NOT EXISTS public.faq_topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.faq_topics_id_seq OWNED BY public.faq_topics.id;

CREATE TABLE IF NOT EXISTS public.faq_topics_locales (
    label character varying NOT NULL,
    id integer NOT NULL,
    _locale public._locales NOT NULL,
    _parent_id integer NOT NULL
);

CREATE SEQUENCE IF NOT EXISTS public.faq_topics_locales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.faq_topics_locales_id_seq OWNED BY public.faq_topics_locales.id;

CREATE TABLE IF NOT EXISTS public.faqs_alias_slugs (
    _order integer NOT NULL,
    _parent_id integer NOT NULL,
    id character varying NOT NULL,
    slug character varying
);

CREATE TABLE IF NOT EXISTS public.faqs_pinned_routes (
    "order" integer NOT NULL,
    parent_id integer NOT NULL,
    value public.enum_faqs_pinned_routes,
    id integer NOT NULL
);

CREATE SEQUENCE IF NOT EXISTS public.faqs_pinned_routes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.faqs_pinned_routes_id_seq OWNED BY public.faqs_pinned_routes.id;

ALTER TABLE ONLY public._faqs_v ALTER COLUMN id SET DEFAULT nextval('public._faqs_v_id_seq'::regclass);

ALTER TABLE ONLY public._faqs_v_locales ALTER COLUMN id SET DEFAULT nextval('public._faqs_v_locales_id_seq'::regclass);

ALTER TABLE ONLY public._faqs_v_rels ALTER COLUMN id SET DEFAULT nextval('public._faqs_v_rels_id_seq'::regclass);

ALTER TABLE ONLY public._faqs_v_version_alias_slugs ALTER COLUMN id SET DEFAULT nextval('public._faqs_v_version_alias_slugs_id_seq'::regclass);

ALTER TABLE ONLY public._faqs_v_version_pinned_routes ALTER COLUMN id SET DEFAULT nextval('public._faqs_v_version_pinned_routes_id_seq'::regclass);

ALTER TABLE ONLY public.faq_topics ALTER COLUMN id SET DEFAULT nextval('public.faq_topics_id_seq'::regclass);

ALTER TABLE ONLY public.faq_topics_locales ALTER COLUMN id SET DEFAULT nextval('public.faq_topics_locales_id_seq'::regclass);

ALTER TABLE ONLY public.faqs_pinned_routes ALTER COLUMN id SET DEFAULT nextval('public.faqs_pinned_routes_id_seq'::regclass);

DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v_locales
    ADD CONSTRAINT _faqs_v_locales_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v
    ADD CONSTRAINT _faqs_v_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v_rels
    ADD CONSTRAINT _faqs_v_rels_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v_version_alias_slugs
    ADD CONSTRAINT _faqs_v_version_alias_slugs_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v_version_pinned_routes
    ADD CONSTRAINT _faqs_v_version_pinned_routes_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.faq_topics_locales
    ADD CONSTRAINT faq_topics_locales_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.faq_topics
    ADD CONSTRAINT faq_topics_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.faqs_alias_slugs
    ADD CONSTRAINT faqs_alias_slugs_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.faqs_pinned_routes
    ADD CONSTRAINT faqs_pinned_routes_pkey PRIMARY KEY (id);
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS _faqs_v_created_at_idx ON public._faqs_v USING btree (created_at);

CREATE INDEX IF NOT EXISTS _faqs_v_latest_idx ON public._faqs_v USING btree (latest);

CREATE UNIQUE INDEX IF NOT EXISTS _faqs_v_locales_locale_parent_id_unique ON public._faqs_v_locales USING btree (_locale, _parent_id);

CREATE INDEX IF NOT EXISTS _faqs_v_parent_idx ON public._faqs_v USING btree (parent_id);

CREATE INDEX IF NOT EXISTS _faqs_v_published_locale_idx ON public._faqs_v USING btree (published_locale);

CREATE INDEX IF NOT EXISTS _faqs_v_rels_faq_topics_id_idx ON public._faqs_v_rels USING btree (faq_topics_id);

CREATE INDEX IF NOT EXISTS _faqs_v_rels_meeting_rooms_id_idx ON public._faqs_v_rels USING btree (meeting_rooms_id);

CREATE INDEX IF NOT EXISTS _faqs_v_rels_order_idx ON public._faqs_v_rels USING btree ("order");

CREATE INDEX IF NOT EXISTS _faqs_v_rels_pages_id_idx ON public._faqs_v_rels USING btree (pages_id);

CREATE INDEX IF NOT EXISTS _faqs_v_rels_parent_idx ON public._faqs_v_rels USING btree (parent_id);

CREATE INDEX IF NOT EXISTS _faqs_v_rels_path_idx ON public._faqs_v_rels USING btree (path);

CREATE INDEX IF NOT EXISTS _faqs_v_rels_rooms_id_idx ON public._faqs_v_rels USING btree (rooms_id);

CREATE INDEX IF NOT EXISTS _faqs_v_rels_venues_id_idx ON public._faqs_v_rels USING btree (venues_id);

CREATE INDEX IF NOT EXISTS _faqs_v_snapshot_idx ON public._faqs_v USING btree (snapshot);

CREATE INDEX IF NOT EXISTS _faqs_v_updated_at_idx ON public._faqs_v USING btree (updated_at);

CREATE INDEX IF NOT EXISTS _faqs_v_version_alias_slugs_order_idx ON public._faqs_v_version_alias_slugs USING btree (_order);

CREATE INDEX IF NOT EXISTS _faqs_v_version_alias_slugs_parent_id_idx ON public._faqs_v_version_alias_slugs USING btree (_parent_id);

CREATE INDEX IF NOT EXISTS _faqs_v_version_pinned_routes_order_idx ON public._faqs_v_version_pinned_routes USING btree ("order");

CREATE INDEX IF NOT EXISTS _faqs_v_version_pinned_routes_parent_idx ON public._faqs_v_version_pinned_routes USING btree (parent_id);

CREATE INDEX IF NOT EXISTS _faqs_v_version_version__status_idx ON public._faqs_v USING btree (version__status);

CREATE INDEX IF NOT EXISTS _faqs_v_version_version_created_at_idx ON public._faqs_v USING btree (version_created_at);

CREATE INDEX IF NOT EXISTS _faqs_v_version_version_merged_into_idx ON public._faqs_v USING btree (version_merged_into_id);

CREATE INDEX IF NOT EXISTS _faqs_v_version_version_slug_idx ON public._faqs_v USING btree (version_slug);

CREATE INDEX IF NOT EXISTS _faqs_v_version_version_topic_idx ON public._faqs_v USING btree (version_topic_id);

CREATE INDEX IF NOT EXISTS _faqs_v_version_version_updated_at_idx ON public._faqs_v USING btree (version_updated_at);

CREATE INDEX IF NOT EXISTS faq_topics_created_at_idx ON public.faq_topics USING btree (created_at);

CREATE UNIQUE INDEX IF NOT EXISTS faq_topics_locales_locale_parent_id_unique ON public.faq_topics_locales USING btree (_locale, _parent_id);

CREATE UNIQUE INDEX IF NOT EXISTS faq_topics_slug_idx ON public.faq_topics USING btree (slug);

CREATE INDEX IF NOT EXISTS faq_topics_updated_at_idx ON public.faq_topics USING btree (updated_at);

CREATE INDEX IF NOT EXISTS faqs_alias_slugs_order_idx ON public.faqs_alias_slugs USING btree (_order);

CREATE INDEX IF NOT EXISTS faqs_alias_slugs_parent_id_idx ON public.faqs_alias_slugs USING btree (_parent_id);

CREATE INDEX IF NOT EXISTS faqs_pinned_routes_order_idx ON public.faqs_pinned_routes USING btree ("order");

CREATE INDEX IF NOT EXISTS faqs_pinned_routes_parent_idx ON public.faqs_pinned_routes USING btree (parent_id);
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v_locales
    ADD CONSTRAINT _faqs_v_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._faqs_v(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v
    ADD CONSTRAINT _faqs_v_parent_id_faqs_id_fk FOREIGN KEY (parent_id) REFERENCES public.faqs(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v_rels
    ADD CONSTRAINT _faqs_v_rels_faq_topics_fk FOREIGN KEY (faq_topics_id) REFERENCES public.faq_topics(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v_rels
    ADD CONSTRAINT _faqs_v_rels_meeting_rooms_fk FOREIGN KEY (meeting_rooms_id) REFERENCES public.meeting_rooms(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v_rels
    ADD CONSTRAINT _faqs_v_rels_pages_fk FOREIGN KEY (pages_id) REFERENCES public.pages(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v_rels
    ADD CONSTRAINT _faqs_v_rels_parent_fk FOREIGN KEY (parent_id) REFERENCES public._faqs_v(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v_rels
    ADD CONSTRAINT _faqs_v_rels_rooms_fk FOREIGN KEY (rooms_id) REFERENCES public.rooms(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v_rels
    ADD CONSTRAINT _faqs_v_rels_venues_fk FOREIGN KEY (venues_id) REFERENCES public.venues(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v_version_alias_slugs
    ADD CONSTRAINT _faqs_v_version_alias_slugs_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public._faqs_v(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v
    ADD CONSTRAINT _faqs_v_version_merged_into_id_faqs_id_fk FOREIGN KEY (version_merged_into_id) REFERENCES public.faqs(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v_version_pinned_routes
    ADD CONSTRAINT _faqs_v_version_pinned_routes_parent_fk FOREIGN KEY (parent_id) REFERENCES public._faqs_v(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public._faqs_v
    ADD CONSTRAINT _faqs_v_version_topic_id_faq_topics_id_fk FOREIGN KEY (version_topic_id) REFERENCES public.faq_topics(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.faq_topics_locales
    ADD CONSTRAINT faq_topics_locales_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.faq_topics(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.faqs_alias_slugs
    ADD CONSTRAINT faqs_alias_slugs_parent_id_fk FOREIGN KEY (_parent_id) REFERENCES public.faqs(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE ONLY public.faqs_pinned_routes
    ADD CONSTRAINT faqs_pinned_routes_parent_fk FOREIGN KEY (parent_id) REFERENCES public.faqs(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;


-- faqs columns + publish existing


ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "audience" "enum_faqs_audience";
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "topic_id" integer;
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "priority" "enum_faqs_priority";
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "merged_into_id" integer;
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "internal_note" varchar;
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "source" "enum_faqs_source";
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "last_reviewed" timestamp(3) with time zone;
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "_status" "enum_faqs_status" DEFAULT 'draft';

DO $$ BEGIN
  ALTER TABLE "faqs" ADD CONSTRAINT "faqs_topic_id_faq_topics_id_fk"
    FOREIGN KEY ("topic_id") REFERENCES "public"."faq_topics"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "faqs" ADD CONSTRAINT "faqs_merged_into_id_faqs_id_fk"
    FOREIGN KEY ("merged_into_id") REFERENCES "public"."faqs"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "faqs_topic_idx" ON "faqs" USING btree ("topic_id");
CREATE INDEX IF NOT EXISTS "faqs_merged_into_idx" ON "faqs" USING btree ("merged_into_id");
CREATE INDEX IF NOT EXISTS "faqs__status_idx" ON "faqs" USING btree ("_status");

-- Payload drafts relaxes these; match push schema
ALTER TABLE "faqs" ALTER COLUMN "context" DROP NOT NULL;
ALTER TABLE "faqs" ALTER COLUMN "category" DROP NOT NULL;
ALTER TABLE "faqs" ALTER COLUMN "order" DROP NOT NULL;
ALTER TABLE "faqs" ALTER COLUMN "slug" DROP NOT NULL;

-- Existing records must remain publicly queryable
UPDATE "faqs" SET "_status" = 'published' WHERE "_status" IS DISTINCT FROM 'published';


-- faqs_rels polymorphic columns


ALTER TABLE "faqs_rels" ADD COLUMN IF NOT EXISTS "faq_topics_id" integer;
ALTER TABLE "faqs_rels" ADD COLUMN IF NOT EXISTS "rooms_id" integer;
ALTER TABLE "faqs_rels" ADD COLUMN IF NOT EXISTS "meeting_rooms_id" integer;
ALTER TABLE "faqs_rels" ADD COLUMN IF NOT EXISTS "venues_id" integer;

DO $$ BEGIN
  ALTER TABLE "faqs_rels" ADD CONSTRAINT "faqs_rels_faq_topics_fk"
    FOREIGN KEY ("faq_topics_id") REFERENCES "public"."faq_topics"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "faqs_rels" ADD CONSTRAINT "faqs_rels_rooms_fk"
    FOREIGN KEY ("rooms_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "faqs_rels" ADD CONSTRAINT "faqs_rels_meeting_rooms_fk"
    FOREIGN KEY ("meeting_rooms_id") REFERENCES "public"."meeting_rooms"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "faqs_rels" ADD CONSTRAINT "faqs_rels_venues_fk"
    FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS "faqs_rels_faq_topics_id_idx" ON "faqs_rels" USING btree ("faq_topics_id");
CREATE INDEX IF NOT EXISTS "faqs_rels_rooms_id_idx" ON "faqs_rels" USING btree ("rooms_id");
CREATE INDEX IF NOT EXISTS "faqs_rels_meeting_rooms_id_idx" ON "faqs_rels" USING btree ("meeting_rooms_id");
CREATE INDEX IF NOT EXISTS "faqs_rels_venues_id_idx" ON "faqs_rels" USING btree ("venues_id");


-- locked docs


ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "faq_topics_id" integer;
DO $$ BEGIN
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faq_topics_fk"
    FOREIGN KEY ("faq_topics_id") REFERENCES "public"."faq_topics"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN invalid_table_definition THEN NULL; END $$;
CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_faq_topics_id_idx"
  ON "payload_locked_documents_rels" USING btree ("faq_topics_id");
