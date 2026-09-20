/**
 * Baseline schema after merging fullpages (CappedRow, amenities list,
 * events agenda, art grid). Empty databases: `npm run migrate`.
 */
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('de', 'en');
  CREATE TYPE "public"."enum_tags_type" AS ENUM('category', 'medium', 'theme', 'amenity', 'neighbourhood');
  CREATE TYPE "public"."enum_rooms_bed_configuration_type" AS ENUM('double', 'queen', 'king', 'king-freestanding', 'twin', 'bunk');
  CREATE TYPE "public"."enum_rooms_bathroom_label" AS ENUM('shower', 'rain-shower', 'bath-shower', 'spa-bathroom');
  CREATE TYPE "public"."enum_meeting_rooms_area" AS ENUM('saal', 'bereich-a', 'bereich-b', 'bereich-c', 'sonderflaeche');
  CREATE TYPE "public"."enum_meeting_documents_category" AS ENUM('general', 'floor-plan', 'hybrid', 'sustainability');
  CREATE TYPE "public"."enum_meeting_documents_area" AS ENUM('saal', 'bereich-a', 'bereich-b', 'bereich-c');
  CREATE TYPE "public"."enum_meeting_documents_page_role" AS ENUM('none', 'hybrid-teaser', 'banquet-teaser');
  CREATE TYPE "public"."enum_meeting_inquiries_locale" AS ENUM('en', 'de');
  CREATE TYPE "public"."enum_venues_venue_type" AS ENUM('Restaurant', 'Bar', 'ArtGallery', 'SportsActivityLocation', 'EventVenue', 'LocalBusiness');
  CREATE TYPE "public"."enum_hero_slides_context" AS ENUM('homepage', 'here');
  CREATE TYPE "public"."enum_amenities_special_hours_kind" AS ENUM('closed', 'hours', 'on-request');
  CREATE TYPE "public"."enum_amenities_kind" AS ENUM('facility', 'service');
  CREATE TYPE "public"."enum_amenities_link_type" AS ENUM('none', 'page', 'venue');
  CREATE TYPE "public"."enum_amenities_link_page" AS ENUM('wallride', 'art', 'dining', 'restaurant', 'meetings', 'neighbourhood');
  CREATE TYPE "public"."enum_amenities_schema_type" AS ENUM('none', 'ExerciseGym', 'SportsActivityLocation', 'ParkingFacility');
  CREATE TYPE "public"."enum_faqs_context" AS ENUM('prospect', 'guest');
  CREATE TYPE "public"."enum_faqs_category" AS ENUM('rooms-booking', 'checkin-checkout', 'dining', 'meetings', 'accessibility', 'getting-here', 'pets-parking', 'general', 'wifi-tech', 'guest-services', 'neighbourhood-guest', 'arrival-departure', 'in-room', 'money-payment', 'health-emergency', 'getting-around', 'house-rules');
  CREATE TYPE "public"."enum_artworks_artwork_type" AS ENUM('mural', 'edition', 'installation');
  CREATE TYPE "public"."enum_artworks_visibility" AS ENUM('live', 'hidden');
  CREATE TYPE "public"."enum_artworks_location_in_building_floor" AS ENUM('B2', 'B1', 'EG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Dach');
  CREATE TYPE "public"."enum_artworks_status" AS ENUM('available', 'sold', 'not-for-sale');
  CREATE TYPE "public"."enum_exhibitions_status" AS ENUM('upcoming', 'current', 'permanent', 'past');
  CREATE TYPE "public"."enum_events_category" AS ENUM('Art', 'Music', 'Sport', 'Food', 'Community', 'Neighbourhood', 'Other');
  CREATE TYPE "public"."enum_events_currency" AS ENUM('EUR');
  CREATE TYPE "public"."enum_people_authority_identifier_property_i_d" AS ENUM('Wikidata', 'GND', 'VIAF', 'GoogleKG');
  CREATE TYPE "public"."enum_people_type" AS ENUM('artist', 'curator', 'host', 'partner', 'staff', 'local');
  CREATE TYPE "public"."enum_people_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_neighbourhood_places_authority_identifier_property_i_d" AS ENUM('Wikidata', 'GND', 'GoogleKG', 'GooglePlaceID');
  CREATE TYPE "public"."enum_neighbourhood_places_category" AS ENUM('Art', 'Bar', 'Kids', 'Museum', 'Parks and Nature', 'Party', 'Restaurant', 'Shopping', 'Sightseeing');
  CREATE TYPE "public"."enum_neighbourhood_places_secondary_category" AS ENUM('Art', 'Bar', 'Kids', 'Museum', 'Parks and Nature', 'Party', 'Restaurant', 'Shopping', 'Sightseeing');
  CREATE TYPE "public"."enum_neighbourhood_places_schema_type" AS ENUM('TouristAttraction', 'LocalBusiness', 'Museum', 'Park', 'Restaurant', 'BarOrPub', 'ShoppingCenter');
  CREATE TYPE "public"."enum_neighbourhood_places_distance_tier" AS ENUM('walkable', 'short-transit', 'further-out');
  CREATE TYPE "public"."enum_neighbourhood_places_indoor_outdoor" AS ENUM('indoor', 'outdoor', 'both');
  CREATE TYPE "public"."enum_neighbourhood_places_image_credit_license" AS ENUM('CC-BY', 'CC-BY-SA', 'licensed-stock', 'original', 'other');
  CREATE TYPE "public"."enum_neighbourhood_places_status" AS ENUM('active', 'inactive');
  CREATE TYPE "public"."enum_places_context" AS ENUM('outside', 'inside', 'both');
  CREATE TYPE "public"."enum_places_type" AS ENUM('monument', 'concierge', 'in-building');
  CREATE TYPE "public"."enum_places_category" AS ENUM('park', 'museum', 'gallery', 'culture', 'restaurant', 'bar', 'cafe', 'shop', 'transport', 'sport', 'other');
  CREATE TYPE "public"."enum_places_pin_icon" AS ENUM('auto', 'building', 'park', 'music', 'cafe', 'shop', 'gallery', 'waves', 'arch', 'sport');
  CREATE TYPE "public"."enum_places_schema_type" AS ENUM('LodgingBusiness', 'TouristAttraction', 'LocalBusiness', 'Restaurant', 'CafeOrCoffeeShop', 'BarOrPub', 'Park', 'ArtGallery', 'Museum', 'SportsActivityLocation');
  CREATE TYPE "public"."enum_pages_context" AS ENUM('outside', 'inside', 'both', 'policy');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('skeleton', 'in-progress', 'live');
  CREATE TYPE "public"."enum_homepage_hero_slides_kb_origin" AS ENUM('bottom-left', 'top-right', 'top-left', 'bottom-right');
  CREATE TYPE "public"."enum_footer_columns_links_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_footer_already_here_column_links_link_type" AS ENUM('internal', 'external');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"lucide_icon" varchar,
  	"type" "enum_tags_type" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "rooms_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "rooms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"from_price" numeric,
  	"currency" varchar DEFAULT 'EUR',
  	"floor_size_m2" numeric,
  	"bed_configuration_type" "enum_rooms_bed_configuration_type",
  	"bed_configuration_details" varchar,
  	"occupancy_max_adults" numeric,
  	"occupancy_max_children" numeric,
  	"occupancy_max_total" numeric,
  	"child_age_min" numeric,
  	"bathroom_label" "enum_rooms_bathroom_label",
  	"bathroom_description" varchar,
  	"has_balcony" boolean DEFAULT false,
  	"has_sauna" boolean DEFAULT false,
  	"has_separate_living" boolean DEFAULT false,
  	"is_accessible" boolean DEFAULT false,
  	"accessibility_features" jsonb,
  	"social_image_id" integer,
  	"booking_url" varchar,
  	"featured" boolean DEFAULT false,
  	"display_order" numeric,
  	"homepage_teaser_enabled" boolean DEFAULT false,
  	"homepage_teaser_order" numeric,
  	"homepage_teaser_teaser_image_id" integer,
  	"story_connection_has_story" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "rooms_locales" (
  	"name" varchar NOT NULL,
  	"short_description" varchar,
  	"description" jsonb,
  	"story_connection_story_teaser" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "rooms_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "meeting_rooms_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "meeting_rooms_images_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "meeting_rooms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"area" "enum_meeting_rooms_area" NOT NULL,
  	"display_order" numeric NOT NULL,
  	"floor_size_m2" numeric NOT NULL,
  	"ceiling_height_m" numeric,
  	"has_daylight" boolean DEFAULT false,
  	"is_divisible" boolean DEFAULT false,
  	"has_screen" boolean DEFAULT false,
  	"has_projector" boolean DEFAULT false,
  	"capacity_theater" numeric,
  	"capacity_classroom" numeric,
  	"capacity_banquet" numeric,
  	"capacity_u_shape" numeric,
  	"capacity_cabaret" numeric,
  	"capacity_reception" numeric,
  	"capacity_block" numeric,
  	"teaser_image_id" integer,
  	"featured" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "meeting_rooms_locales" (
  	"name" varchar NOT NULL,
  	"short_description" varchar NOT NULL,
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "meeting_rooms_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"meeting_rooms_id" integer
  );
  
  CREATE TABLE "meeting_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"key" varchar NOT NULL,
  	"category" "enum_meeting_documents_category" NOT NULL,
  	"area" "enum_meeting_documents_area",
  	"page_role" "enum_meeting_documents_page_role" DEFAULT 'none',
  	"sort_order" numeric DEFAULT 100 NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "meeting_documents_locales" (
  	"title" varchar NOT NULL,
  	"file_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "meeting_inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"company" varchar,
  	"contact_person" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone NOT NULL,
  	"event_type" varchar NOT NULL,
  	"guest_count" numeric,
  	"room_count" numeric,
  	"overnight_guest_count" numeric,
  	"stay_duration" varchar,
  	"room_of_interest_id" integer,
  	"is_room_block" boolean DEFAULT false,
  	"notes" varchar,
  	"privacy_accepted" boolean DEFAULT false NOT NULL,
  	"consent_given" boolean DEFAULT false NOT NULL,
  	"locale" "enum_meeting_inquiries_locale" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "venues_opening_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day_of_week" varchar,
  	"opens" varchar,
  	"closes" varchar,
  	"is_open_ended" boolean DEFAULT false,
  	"segment" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "venues_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"alt" varchar NOT NULL
  );
  
  CREATE TABLE "venues_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "venues" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"venue_type" "enum_venues_venue_type" NOT NULL,
  	"telephone" varchar,
  	"email" varchar,
  	"website" varchar,
  	"instagram_url" varchar,
  	"venue_monogram_id" integer,
  	"serves_cuisine" varchar,
  	"reservation_url" varchar,
  	"menu_url" varchar,
  	"price_range" varchar,
  	"is_open_to_public" boolean DEFAULT true,
  	"is_guest_facing" boolean DEFAULT true,
  	"hero_image_id" integer,
  	"featured" boolean DEFAULT false,
  	"display_order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "venues_locales" (
  	"name" varchar NOT NULL,
  	"tagline" varchar,
  	"description" jsonb,
  	"short_description" varchar,
  	"location" varchar,
  	"spotlight_location" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "venues_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "hero_slides" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"admin_title" varchar,
  	"image_id" integer NOT NULL,
  	"venue_id" integer,
  	"credit" varchar,
  	"context" "enum_hero_slides_context" DEFAULT 'homepage' NOT NULL,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "hero_slides_locales" (
  	"alt_text" varchar NOT NULL,
  	"caption_override" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "amenities_opening_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day_of_week" varchar,
  	"opens" varchar,
  	"closes" varchar,
  	"is_open_ended" boolean DEFAULT false,
  	"segment" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "amenities_special_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valid_from" timestamp(3) with time zone NOT NULL,
  	"valid_through" timestamp(3) with time zone,
  	"kind" "enum_amenities_special_hours_kind" DEFAULT 'closed' NOT NULL,
  	"opens" varchar,
  	"closes" varchar
  );
  
  CREATE TABLE "amenities_special_hours_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "amenities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"kind" "enum_amenities_kind" DEFAULT 'facility' NOT NULL,
  	"slug" varchar NOT NULL,
  	"lucide_icon" varchar,
  	"image_id" integer,
  	"href" varchar,
  	"link_type" "enum_amenities_link_type" DEFAULT 'none',
  	"link_page" "enum_amenities_link_page",
  	"link_venue_id" integer,
  	"schema_type" "enum_amenities_schema_type" DEFAULT 'none',
  	"show_in_hub" boolean DEFAULT true,
  	"pending" boolean DEFAULT false,
  	"hidden" boolean DEFAULT false,
  	"include_in_schema" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "amenities_locales" (
  	"title" varchar NOT NULL,
  	"location" varchar,
  	"hours_override" varchar,
  	"price" varchar,
  	"what" varchar,
  	"summary" varchar,
  	"details" jsonb,
  	"access" varchar,
  	"subline" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "amenities_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"faqs_id" integer
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"context" "enum_faqs_context" NOT NULL,
  	"category" "enum_faqs_category" NOT NULL,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs_locales" (
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "faqs_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer
  );
  
  CREATE TABLE "artists" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"alias" varchar,
  	"person_id" integer,
  	"short_bio" varchar,
  	"portrait_id" integer,
  	"website" varchar,
  	"instagram" varchar,
  	"nationality" varchar,
  	"based_in" varchar,
  	"medium" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "artists_locales" (
  	"bio" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "artists_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "artworks_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"alt" varchar NOT NULL
  );
  
  CREATE TABLE "artworks" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"artwork_type" "enum_artworks_artwork_type" DEFAULT 'mural' NOT NULL,
  	"visibility" "enum_artworks_visibility" DEFAULT 'live' NOT NULL,
  	"artist_id" integer NOT NULL,
  	"edition_number" varchar,
  	"medium" varchar,
  	"dimensions" varchar,
  	"year" numeric,
  	"location_in_building_floor" "enum_artworks_location_in_building_floor",
  	"status" "enum_artworks_status",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "artworks_locales" (
  	"description" jsonb,
  	"location_in_building_spot" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "artworks_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "exhibitions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"subtitle" varchar,
  	"start_date" timestamp(3) with time zone,
  	"end_date" timestamp(3) with time zone,
  	"location" varchar,
  	"venue_id" integer,
  	"hero_image_id" integer,
  	"status" "enum_exhibitions_status",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "exhibitions_locales" (
  	"description" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "exhibitions_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"artists_id" integer,
  	"artworks_id" integer
  );
  
  CREATE TABLE "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"start_date" timestamp(3) with time zone NOT NULL,
  	"end_date" timestamp(3) with time zone,
  	"category" "enum_events_category",
  	"venue_id" integer,
  	"is_free" boolean DEFAULT false,
  	"price" numeric,
  	"currency" "enum_events_currency" DEFAULT 'EUR',
  	"booking_required" boolean DEFAULT false,
  	"ticket_url" varchar,
  	"hero_image_id" integer,
  	"featured" boolean DEFAULT false,
  	"is_recurring" boolean DEFAULT false,
  	"recurrence_rule" varchar,
  	"recurrence_note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "events_locales" (
  	"name" varchar NOT NULL,
  	"description" jsonb,
  	"short_description" varchar,
  	"booking_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "events_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "people_authority_identifier" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"property_i_d" "enum_people_authority_identifier_property_i_d" NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "people_authority_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"job_title" varchar,
  	"short_bio" varchar,
  	"quote" varchar,
  	"video" varchar,
  	"portrait_id" integer,
  	"website" varchar,
  	"instagram" varchar,
  	"room_number" varchar,
  	"room_confirmed" boolean DEFAULT false,
  	"based_in" varchar,
  	"type" "enum_people_type" NOT NULL,
  	"related_venue_id" integer,
  	"featured" boolean DEFAULT false,
  	"display_order" numeric,
  	"status" "enum_people_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "people_locales" (
  	"bio" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "people_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer
  );
  
  CREATE TABLE "neighbourhood_places_target_audience" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "neighbourhood_places_endorsements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"person_id" integer NOT NULL,
  	"quote" varchar NOT NULL,
  	"associated_room" varchar
  );
  
  CREATE TABLE "neighbourhood_places_authority_identifier" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"property_i_d" "enum_neighbourhood_places_authority_identifier_property_i_d" NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "neighbourhood_places_authority_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "neighbourhood_places" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"category" "enum_neighbourhood_places_category" NOT NULL,
  	"secondary_category" "enum_neighbourhood_places_secondary_category",
  	"schema_type" "enum_neighbourhood_places_schema_type" NOT NULL,
  	"address_street_address" varchar,
  	"address_address_locality" varchar DEFAULT 'Berlin' NOT NULL,
  	"address_postal_code" varchar,
  	"geo_latitude" numeric,
  	"geo_longitude" numeric,
  	"walking_minutes" numeric,
  	"transit_minutes" numeric,
  	"transit_station" varchar,
  	"transit_line" varchar,
  	"distance_tier" "enum_neighbourhood_places_distance_tier",
  	"indoor_outdoor" "enum_neighbourhood_places_indoor_outdoor",
  	"website" varchar,
  	"opening_hours" varchar,
  	"price_range" varchar,
  	"image_id" integer,
  	"image_credit_credit_text" varchar,
  	"image_credit_credit_url" varchar,
  	"image_credit_license" "enum_neighbourhood_places_image_credit_license",
  	"homepage_teaser_enabled" boolean DEFAULT false,
  	"homepage_teaser_order" numeric,
  	"here_teaser_enabled" boolean DEFAULT false,
  	"here_teaser_order" numeric,
  	"featured_order" numeric,
  	"status" "enum_neighbourhood_places_status" DEFAULT 'active' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "neighbourhood_places_locales" (
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "places" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"context" "enum_places_context" NOT NULL,
  	"type" "enum_places_type" NOT NULL,
  	"category" "enum_places_category" NOT NULL,
  	"short_description" varchar NOT NULL,
  	"short_description_d_e" varchar,
  	"full_description" jsonb,
  	"location_lat" numeric NOT NULL,
  	"location_lng" numeric NOT NULL,
  	"address" varchar,
  	"walking_minutes" numeric,
  	"walking_note" varchar,
  	"floor" varchar,
  	"website" varchar,
  	"hours" varchar,
  	"image_id" integer,
  	"pin_icon" "enum_places_pin_icon" DEFAULT 'auto',
  	"schema_type" "enum_places_schema_type" DEFAULT 'TouristAttraction',
  	"featured" boolean DEFAULT false,
  	"active" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"context" "enum_pages_context" NOT NULL,
  	"status" "enum_pages_status" DEFAULT 'skeleton',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"tags_id" integer,
  	"rooms_id" integer,
  	"meeting_rooms_id" integer,
  	"meeting_documents_id" integer,
  	"meeting_inquiries_id" integer,
  	"venues_id" integer,
  	"hero_slides_id" integer,
  	"amenities_id" integer,
  	"faqs_id" integer,
  	"artists_id" integer,
  	"artworks_id" integer,
  	"exhibitions_id" integer,
  	"events_id" integer,
  	"people_id" integer,
  	"neighbourhood_places_id" integer,
  	"places_id" integer,
  	"pages_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "hotel_same_as" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "hotel_amenity_feature" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"value" boolean DEFAULT true
  );
  
  CREATE TABLE "hotel_certifications" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"url" varchar
  );
  
  CREATE TABLE "hotel_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day_of_week" varchar,
  	"opens" varchar,
  	"closes" varchar,
  	"is_open_ended" boolean DEFAULT false,
  	"segment" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "hotel_meet_and_work_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "hotel_meet_and_work_slides_locales" (
  	"image_alt" varchar,
  	"caption" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "hotel" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"legal_name" varchar,
  	"url" varchar,
  	"telephone" varchar,
  	"conference_phone" varchar,
  	"email" varchar,
  	"address_street_address" varchar,
  	"address_address_locality" varchar,
  	"address_postal_code" varchar,
  	"address_address_country" varchar,
  	"geo_latitude" numeric,
  	"geo_longitude" numeric,
  	"has_map" varchar,
  	"directions_url" varchar,
  	"map_bounds_north" numeric,
  	"map_bounds_south" numeric,
  	"map_bounds_west" numeric,
  	"map_bounds_east" numeric,
  	"checkin_time" varchar,
  	"checkout_time" varchar,
  	"guest_stay_wifi_network" varchar,
  	"guest_stay_wifi_password" varchar,
  	"guest_stay_checkout_value_d_e" varchar DEFAULT '12:00',
  	"guest_stay_checkout_value_e_n" varchar DEFAULT '12:00',
  	"guest_stay_checkout_note_d_e" varchar DEFAULT 'Später auf Anfrage',
  	"guest_stay_checkout_note_e_n" varchar DEFAULT 'Later on request',
  	"guest_stay_breakfast_value_d_e" varchar DEFAULT '06:30 – 10:00',
  	"guest_stay_breakfast_value_e_n" varchar DEFAULT '06:30 – 10:00',
  	"guest_stay_breakfast_note_d_e" varchar DEFAULT 'Lütze, Erdgeschoss',
  	"guest_stay_breakfast_note_e_n" varchar DEFAULT 'Lütze, ground floor',
  	"guest_stay_parking_value_d_e" varchar DEFAULT '4 € / Std.',
  	"guest_stay_parking_value_e_n" varchar DEFAULT '€4 / hour',
  	"guest_stay_parking_note_d_e" varchar DEFAULT 'Tiefgarage · max. 25 €/Tag',
  	"guest_stay_parking_note_e_n" varchar DEFAULT 'Underground · max. €25/day',
  	"guest_stay_luggage_value_d_e" varchar DEFAULT 'Rezeption',
  	"guest_stay_luggage_value_e_n" varchar DEFAULT 'Reception',
  	"guest_stay_luggage_note_d_e" varchar DEFAULT 'Auch nach dem Check-out',
  	"guest_stay_luggage_note_e_n" varchar DEFAULT 'Also after check-out',
  	"guest_stay_more_wundermart_value_d_e" varchar,
  	"guest_stay_more_wundermart_value_e_n" varchar,
  	"guest_stay_more_wundermart_note_d_e" varchar,
  	"guest_stay_more_wundermart_note_e_n" varchar,
  	"guest_stay_more_bett_and_bike_value_d_e" varchar,
  	"guest_stay_more_bett_and_bike_value_e_n" varchar,
  	"guest_stay_more_bett_and_bike_note_d_e" varchar,
  	"guest_stay_more_bett_and_bike_note_e_n" varchar,
  	"guest_stay_more_sauna_fitness_value_d_e" varchar DEFAULT '24/7',
  	"guest_stay_more_sauna_fitness_value_e_n" varchar DEFAULT '24/7',
  	"guest_stay_more_sauna_fitness_note_d_e" varchar DEFAULT 'Sauna · Fitness',
  	"guest_stay_more_sauna_fitness_note_e_n" varchar DEFAULT 'Sauna · gym',
  	"guest_stay_more_pets_value_d_e" varchar DEFAULT '€30 / Tag',
  	"guest_stay_more_pets_value_e_n" varchar DEFAULT '€30 / day',
  	"guest_stay_more_pets_note_d_e" varchar DEFAULT 'Hunde willkommen',
  	"guest_stay_more_pets_note_e_n" varchar DEFAULT 'Dogs welcome',
  	"bridge_nav_to_here_label_e_n" varchar DEFAULT 'Already in the house? ENTER →',
  	"bridge_nav_to_here_label_d_e" varchar DEFAULT 'Schon im Haus? ENTER →',
  	"bridge_nav_to_stay_label_e_n" varchar DEFAULT 'Not here yet? STAY →',
  	"bridge_nav_to_stay_label_d_e" varchar DEFAULT 'Noch nicht hier? BLEIB →',
  	"star_rating" numeric,
  	"price_range" varchar,
  	"total_rooms" numeric,
  	"founding_date" varchar,
  	"brand" varchar,
  	"parent_organization" varchar,
  	"wikidata_id" varchar,
  	"opening_hours_reception" varchar,
  	"opening_hours_breakfast" varchar,
  	"breakfast_pricing_adult_price" numeric,
  	"breakfast_pricing_child_price" numeric,
  	"breakfast_pricing_child_age_from" numeric,
  	"room_service_offered" boolean DEFAULT false,
  	"hero_map_image_id" integer,
  	"compare_table_enabled" boolean DEFAULT true,
  	"rooms_suites_callout_enabled" boolean DEFAULT true,
  	"rooms_suites_callout_insert_after_slug" varchar DEFAULT 'premium',
  	"eat_and_drink_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "hotel_locales" (
  	"description" jsonb,
  	"short_description" varchar,
  	"guest_stay_checkout_note" varchar,
  	"guest_stay_breakfast_location" varchar,
  	"guest_stay_parking_summary" varchar,
  	"guest_stay_luggage_note" varchar,
  	"room_service_note" varchar,
  	"get_directions_label" varchar,
  	"hero_short_address" varchar,
  	"meet_and_work_kicker" varchar,
  	"meet_and_work_subhead" varchar,
  	"meet_and_work_body" varchar,
  	"meet_and_work_cta_label" varchar,
  	"rooms_page_intro_title" varchar,
  	"rooms_page_intro_body" varchar,
  	"rooms_suites_callout_quote" varchar,
  	"rooms_suites_callout_title" varchar,
  	"rooms_suites_callout_body" varchar,
  	"eat_and_drink_kicker" varchar,
  	"eat_and_drink_heading" varchar,
  	"eat_and_drink_body" varchar,
  	"eat_and_drink_image_alt" varchar,
  	"eat_and_drink_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "homepage_hero_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"kb_origin" "enum_homepage_hero_slides_kb_origin" DEFAULT 'bottom-left' NOT NULL
  );
  
  CREATE TABLE "homepage_hero_slides_locales" (
  	"alt" varchar NOT NULL,
  	"caption" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_locales" (
  	"rooms_teaser_heading" varchar,
  	"rooms_teaser_body" varchar,
  	"rooms_teaser_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "navigation_secondary_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"page_id" integer NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_contact_address_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"line" varchar NOT NULL
  );
  
  CREATE TABLE "footer_contact_transit_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "footer_contact_transit_lines_locales" (
  	"line" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_columns_links_link_type" DEFAULT 'internal',
  	"internal_page_id" integer,
  	"external_url" varchar,
  	"show_arrow" boolean DEFAULT false,
  	"divider_before" boolean DEFAULT false
  );
  
  CREATE TABLE "footer_columns_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" varchar
  );
  
  CREATE TABLE "footer_columns_locales" (
  	"title" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_already_here_column_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_already_here_column_links_link_type" DEFAULT 'internal',
  	"internal_page_id" integer,
  	"external_url" varchar,
  	"show_arrow" boolean DEFAULT false,
  	"divider_before" boolean DEFAULT false
  );
  
  CREATE TABLE "footer_already_here_column_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_awards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"visible" boolean DEFAULT true,
  	"image_id" integer NOT NULL,
  	"link_url" varchar
  );
  
  CREATE TABLE "footer_awards_locales" (
  	"alt_text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_partner_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"visible" boolean DEFAULT true,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer_partner_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"visible" boolean DEFAULT true,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "footer_legal_links_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"book_direct_strip_visible" boolean DEFAULT true,
  	"book_direct_strip_cta_url" varchar DEFAULT '/book',
  	"contact_since_year" varchar DEFAULT '1958',
  	"contact_phone" varchar,
  	"contact_email" varchar,
  	"already_here_column_icon" varchar,
  	"copyright_entity" varchar DEFAULT 'Pandox Berlin GmbH',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"book_direct_strip_message" varchar,
  	"book_direct_strip_cta_label" varchar,
  	"already_here_column_title" varchar NOT NULL,
  	"already_here_column_description" varchar,
  	"awards_heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "meetings_hero_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "meetings_hero_slides_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "meetings_event_types" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar DEFAULT '',
  	"image_id" integer,
  	"lucide_icon" varchar
  );
  
  CREATE TABLE "meetings_event_types_locales" (
  	"label" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "meetings_facilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"lucide_icon" varchar NOT NULL
  );
  
  CREATE TABLE "meetings_facilities_locales" (
  	"label" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "meetings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"contact_phone" varchar DEFAULT '+49 30 2605 2700',
  	"contact_email" varchar DEFAULT 'meetings@hotel-berlin.de',
  	"hybrid_teaser_image_id" integer,
  	"food_drink_teaser_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "meetings_locales" (
  	"hero_kicker" varchar,
  	"hero_headline" varchar,
  	"hero_intro" varchar,
  	"hero_contact_label" varchar,
  	"event_types_heading" varchar,
  	"hybrid_teaser_kicker" varchar,
  	"hybrid_teaser_headline" varchar,
  	"hybrid_teaser_body" varchar,
  	"hybrid_teaser_cta_label" varchar,
  	"food_drink_teaser_kicker" varchar,
  	"food_drink_teaser_headline" varchar,
  	"food_drink_teaser_body" varchar,
  	"food_drink_teaser_cta_label" varchar,
  	"closing_headline" varchar,
  	"closing_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tags_locales" ADD CONSTRAINT "tags_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rooms_images" ADD CONSTRAINT "rooms_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rooms_images" ADD CONSTRAINT "rooms_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rooms" ADD CONSTRAINT "rooms_social_image_id_media_id_fk" FOREIGN KEY ("social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rooms" ADD CONSTRAINT "rooms_homepage_teaser_teaser_image_id_media_id_fk" FOREIGN KEY ("homepage_teaser_teaser_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "rooms_locales" ADD CONSTRAINT "rooms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rooms_rels" ADD CONSTRAINT "rooms_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "rooms_rels" ADD CONSTRAINT "rooms_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meeting_rooms_images" ADD CONSTRAINT "meeting_rooms_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meeting_rooms_images" ADD CONSTRAINT "meeting_rooms_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meeting_rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meeting_rooms_images_locales" ADD CONSTRAINT "meeting_rooms_images_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meeting_rooms_images"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meeting_rooms" ADD CONSTRAINT "meeting_rooms_teaser_image_id_media_id_fk" FOREIGN KEY ("teaser_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meeting_rooms_locales" ADD CONSTRAINT "meeting_rooms_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meeting_rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meeting_rooms_rels" ADD CONSTRAINT "meeting_rooms_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."meeting_rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meeting_rooms_rels" ADD CONSTRAINT "meeting_rooms_rels_meeting_rooms_fk" FOREIGN KEY ("meeting_rooms_id") REFERENCES "public"."meeting_rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meeting_documents_locales" ADD CONSTRAINT "meeting_documents_locales_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meeting_documents_locales" ADD CONSTRAINT "meeting_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meeting_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meeting_inquiries" ADD CONSTRAINT "meeting_inquiries_room_of_interest_id_meeting_rooms_id_fk" FOREIGN KEY ("room_of_interest_id") REFERENCES "public"."meeting_rooms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_opening_hours" ADD CONSTRAINT "venues_opening_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_images" ADD CONSTRAINT "venues_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_images" ADD CONSTRAINT "venues_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_same_as" ADD CONSTRAINT "venues_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues" ADD CONSTRAINT "venues_venue_monogram_id_media_id_fk" FOREIGN KEY ("venue_monogram_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues" ADD CONSTRAINT "venues_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "venues_locales" ADD CONSTRAINT "venues_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "venues_rels" ADD CONSTRAINT "venues_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_slides" ADD CONSTRAINT "hero_slides_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hero_slides_locales" ADD CONSTRAINT "hero_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hero_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "amenities_opening_hours" ADD CONSTRAINT "amenities_opening_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "amenities_special_hours" ADD CONSTRAINT "amenities_special_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "amenities_special_hours_locales" ADD CONSTRAINT "amenities_special_hours_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."amenities_special_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "amenities" ADD CONSTRAINT "amenities_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "amenities" ADD CONSTRAINT "amenities_link_venue_id_venues_id_fk" FOREIGN KEY ("link_venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "amenities_locales" ADD CONSTRAINT "amenities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "amenities_rels" ADD CONSTRAINT "amenities_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "amenities_rels" ADD CONSTRAINT "amenities_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_locales" ADD CONSTRAINT "faqs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_rels" ADD CONSTRAINT "faqs_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_rels" ADD CONSTRAINT "faqs_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artists" ADD CONSTRAINT "artists_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artists" ADD CONSTRAINT "artists_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artists_locales" ADD CONSTRAINT "artists_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artists_rels" ADD CONSTRAINT "artists_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."artists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artists_rels" ADD CONSTRAINT "artists_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artworks_images" ADD CONSTRAINT "artworks_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artworks_images" ADD CONSTRAINT "artworks_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artworks" ADD CONSTRAINT "artworks_artist_id_artists_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "artworks_locales" ADD CONSTRAINT "artworks_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artworks_rels" ADD CONSTRAINT "artworks_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "artworks_rels" ADD CONSTRAINT "artworks_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exhibitions" ADD CONSTRAINT "exhibitions_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "exhibitions" ADD CONSTRAINT "exhibitions_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "exhibitions_locales" ADD CONSTRAINT "exhibitions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."exhibitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exhibitions_rels" ADD CONSTRAINT "exhibitions_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."exhibitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exhibitions_rels" ADD CONSTRAINT "exhibitions_rels_artists_fk" FOREIGN KEY ("artists_id") REFERENCES "public"."artists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "exhibitions_rels" ADD CONSTRAINT "exhibitions_rels_artworks_fk" FOREIGN KEY ("artworks_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events" ADD CONSTRAINT "events_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "events_locales" ADD CONSTRAINT "events_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "events_rels" ADD CONSTRAINT "events_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people_authority_identifier" ADD CONSTRAINT "people_authority_identifier_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people_authority_same_as" ADD CONSTRAINT "people_authority_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_portrait_id_media_id_fk" FOREIGN KEY ("portrait_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_related_venue_id_venues_id_fk" FOREIGN KEY ("related_venue_id") REFERENCES "public"."venues"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people_locales" ADD CONSTRAINT "people_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people_rels" ADD CONSTRAINT "people_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "people_rels" ADD CONSTRAINT "people_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "neighbourhood_places_target_audience" ADD CONSTRAINT "neighbourhood_places_target_audience_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."neighbourhood_places"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "neighbourhood_places_endorsements" ADD CONSTRAINT "neighbourhood_places_endorsements_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "neighbourhood_places_endorsements" ADD CONSTRAINT "neighbourhood_places_endorsements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."neighbourhood_places"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "neighbourhood_places_authority_identifier" ADD CONSTRAINT "neighbourhood_places_authority_identifier_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."neighbourhood_places"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "neighbourhood_places_authority_same_as" ADD CONSTRAINT "neighbourhood_places_authority_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."neighbourhood_places"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "neighbourhood_places" ADD CONSTRAINT "neighbourhood_places_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "neighbourhood_places_locales" ADD CONSTRAINT "neighbourhood_places_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."neighbourhood_places"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "places" ADD CONSTRAINT "places_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_rooms_fk" FOREIGN KEY ("rooms_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_meeting_rooms_fk" FOREIGN KEY ("meeting_rooms_id") REFERENCES "public"."meeting_rooms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_meeting_documents_fk" FOREIGN KEY ("meeting_documents_id") REFERENCES "public"."meeting_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_meeting_inquiries_fk" FOREIGN KEY ("meeting_inquiries_id") REFERENCES "public"."meeting_inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_venues_fk" FOREIGN KEY ("venues_id") REFERENCES "public"."venues"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_hero_slides_fk" FOREIGN KEY ("hero_slides_id") REFERENCES "public"."hero_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_amenities_fk" FOREIGN KEY ("amenities_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_artists_fk" FOREIGN KEY ("artists_id") REFERENCES "public"."artists"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_artworks_fk" FOREIGN KEY ("artworks_id") REFERENCES "public"."artworks"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_exhibitions_fk" FOREIGN KEY ("exhibitions_id") REFERENCES "public"."exhibitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_neighbourhood_places_fk" FOREIGN KEY ("neighbourhood_places_id") REFERENCES "public"."neighbourhood_places"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_places_fk" FOREIGN KEY ("places_id") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hotel_same_as" ADD CONSTRAINT "hotel_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hotel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hotel_amenity_feature" ADD CONSTRAINT "hotel_amenity_feature_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hotel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hotel_certifications" ADD CONSTRAINT "hotel_certifications_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hotel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hotel_hours" ADD CONSTRAINT "hotel_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hotel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hotel_meet_and_work_slides" ADD CONSTRAINT "hotel_meet_and_work_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hotel_meet_and_work_slides" ADD CONSTRAINT "hotel_meet_and_work_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hotel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hotel_meet_and_work_slides_locales" ADD CONSTRAINT "hotel_meet_and_work_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hotel_meet_and_work_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "hotel" ADD CONSTRAINT "hotel_hero_map_image_id_media_id_fk" FOREIGN KEY ("hero_map_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hotel" ADD CONSTRAINT "hotel_eat_and_drink_image_id_media_id_fk" FOREIGN KEY ("eat_and_drink_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "hotel_locales" ADD CONSTRAINT "hotel_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."hotel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_hero_slides" ADD CONSTRAINT "homepage_hero_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_hero_slides" ADD CONSTRAINT "homepage_hero_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_hero_slides_locales" ADD CONSTRAINT "homepage_hero_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage_hero_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_locales" ADD CONSTRAINT "homepage_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_secondary_links" ADD CONSTRAINT "navigation_secondary_links_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "navigation_secondary_links" ADD CONSTRAINT "navigation_secondary_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_contact_address_lines" ADD CONSTRAINT "footer_contact_address_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_contact_transit_lines" ADD CONSTRAINT "footer_contact_transit_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_contact_transit_lines_locales" ADD CONSTRAINT "footer_contact_transit_lines_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_contact_transit_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_internal_page_id_pages_id_fk" FOREIGN KEY ("internal_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links_locales" ADD CONSTRAINT "footer_columns_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_locales" ADD CONSTRAINT "footer_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_already_here_column_links" ADD CONSTRAINT "footer_already_here_column_links_internal_page_id_pages_id_fk" FOREIGN KEY ("internal_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_already_here_column_links" ADD CONSTRAINT "footer_already_here_column_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_already_here_column_links_locales" ADD CONSTRAINT "footer_already_here_column_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_already_here_column_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_awards" ADD CONSTRAINT "footer_awards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_awards" ADD CONSTRAINT "footer_awards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_awards_locales" ADD CONSTRAINT "footer_awards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_awards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_partner_links" ADD CONSTRAINT "footer_partner_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_partner_links_locales" ADD CONSTRAINT "footer_partner_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_partner_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links_locales" ADD CONSTRAINT "footer_legal_links_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_legal_links"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meetings_hero_slides" ADD CONSTRAINT "meetings_hero_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meetings_hero_slides" ADD CONSTRAINT "meetings_hero_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meetings_hero_slides_locales" ADD CONSTRAINT "meetings_hero_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meetings_hero_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meetings_event_types" ADD CONSTRAINT "meetings_event_types_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meetings_event_types" ADD CONSTRAINT "meetings_event_types_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meetings_event_types_locales" ADD CONSTRAINT "meetings_event_types_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meetings_event_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meetings_facilities" ADD CONSTRAINT "meetings_facilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meetings_facilities_locales" ADD CONSTRAINT "meetings_facilities_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meetings_facilities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "meetings" ADD CONSTRAINT "meetings_hybrid_teaser_image_id_media_id_fk" FOREIGN KEY ("hybrid_teaser_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meetings" ADD CONSTRAINT "meetings_food_drink_teaser_image_id_media_id_fk" FOREIGN KEY ("food_drink_teaser_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "meetings_locales" ADD CONSTRAINT "meetings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE UNIQUE INDEX "tags_locales_locale_parent_id_unique" ON "tags_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rooms_images_order_idx" ON "rooms_images" USING btree ("_order");
  CREATE INDEX "rooms_images_parent_id_idx" ON "rooms_images" USING btree ("_parent_id");
  CREATE INDEX "rooms_images_image_idx" ON "rooms_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "rooms_slug_idx" ON "rooms" USING btree ("slug");
  CREATE INDEX "rooms_social_image_idx" ON "rooms" USING btree ("social_image_id");
  CREATE INDEX "rooms_homepage_teaser_homepage_teaser_teaser_image_idx" ON "rooms" USING btree ("homepage_teaser_teaser_image_id");
  CREATE INDEX "rooms_updated_at_idx" ON "rooms" USING btree ("updated_at");
  CREATE INDEX "rooms_created_at_idx" ON "rooms" USING btree ("created_at");
  CREATE UNIQUE INDEX "rooms_locales_locale_parent_id_unique" ON "rooms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "rooms_rels_order_idx" ON "rooms_rels" USING btree ("order");
  CREATE INDEX "rooms_rels_parent_idx" ON "rooms_rels" USING btree ("parent_id");
  CREATE INDEX "rooms_rels_path_idx" ON "rooms_rels" USING btree ("path");
  CREATE INDEX "rooms_rels_tags_id_idx" ON "rooms_rels" USING btree ("tags_id");
  CREATE INDEX "meeting_rooms_images_order_idx" ON "meeting_rooms_images" USING btree ("_order");
  CREATE INDEX "meeting_rooms_images_parent_id_idx" ON "meeting_rooms_images" USING btree ("_parent_id");
  CREATE INDEX "meeting_rooms_images_image_idx" ON "meeting_rooms_images" USING btree ("image_id");
  CREATE UNIQUE INDEX "meeting_rooms_images_locales_locale_parent_id_unique" ON "meeting_rooms_images_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "meeting_rooms_slug_idx" ON "meeting_rooms" USING btree ("slug");
  CREATE INDEX "meeting_rooms_teaser_image_idx" ON "meeting_rooms" USING btree ("teaser_image_id");
  CREATE INDEX "meeting_rooms_updated_at_idx" ON "meeting_rooms" USING btree ("updated_at");
  CREATE INDEX "meeting_rooms_created_at_idx" ON "meeting_rooms" USING btree ("created_at");
  CREATE UNIQUE INDEX "meeting_rooms_locales_locale_parent_id_unique" ON "meeting_rooms_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "meeting_rooms_rels_order_idx" ON "meeting_rooms_rels" USING btree ("order");
  CREATE INDEX "meeting_rooms_rels_parent_idx" ON "meeting_rooms_rels" USING btree ("parent_id");
  CREATE INDEX "meeting_rooms_rels_path_idx" ON "meeting_rooms_rels" USING btree ("path");
  CREATE INDEX "meeting_rooms_rels_meeting_rooms_id_idx" ON "meeting_rooms_rels" USING btree ("meeting_rooms_id");
  CREATE UNIQUE INDEX "meeting_documents_key_idx" ON "meeting_documents" USING btree ("key");
  CREATE INDEX "meeting_documents_updated_at_idx" ON "meeting_documents" USING btree ("updated_at");
  CREATE INDEX "meeting_documents_created_at_idx" ON "meeting_documents" USING btree ("created_at");
  CREATE INDEX "meeting_documents_file_idx" ON "meeting_documents_locales" USING btree ("file_id","_locale");
  CREATE UNIQUE INDEX "meeting_documents_locales_locale_parent_id_unique" ON "meeting_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "meeting_inquiries_room_of_interest_idx" ON "meeting_inquiries" USING btree ("room_of_interest_id");
  CREATE INDEX "meeting_inquiries_updated_at_idx" ON "meeting_inquiries" USING btree ("updated_at");
  CREATE INDEX "meeting_inquiries_created_at_idx" ON "meeting_inquiries" USING btree ("created_at");
  CREATE INDEX "venues_opening_hours_order_idx" ON "venues_opening_hours" USING btree ("_order");
  CREATE INDEX "venues_opening_hours_parent_id_idx" ON "venues_opening_hours" USING btree ("_parent_id");
  CREATE INDEX "venues_images_order_idx" ON "venues_images" USING btree ("_order");
  CREATE INDEX "venues_images_parent_id_idx" ON "venues_images" USING btree ("_parent_id");
  CREATE INDEX "venues_images_image_idx" ON "venues_images" USING btree ("image_id");
  CREATE INDEX "venues_same_as_order_idx" ON "venues_same_as" USING btree ("_order");
  CREATE INDEX "venues_same_as_parent_id_idx" ON "venues_same_as" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "venues_slug_idx" ON "venues" USING btree ("slug");
  CREATE INDEX "venues_venue_monogram_idx" ON "venues" USING btree ("venue_monogram_id");
  CREATE INDEX "venues_hero_image_idx" ON "venues" USING btree ("hero_image_id");
  CREATE INDEX "venues_updated_at_idx" ON "venues" USING btree ("updated_at");
  CREATE INDEX "venues_created_at_idx" ON "venues" USING btree ("created_at");
  CREATE UNIQUE INDEX "venues_locales_locale_parent_id_unique" ON "venues_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "venues_rels_order_idx" ON "venues_rels" USING btree ("order");
  CREATE INDEX "venues_rels_parent_idx" ON "venues_rels" USING btree ("parent_id");
  CREATE INDEX "venues_rels_path_idx" ON "venues_rels" USING btree ("path");
  CREATE INDEX "venues_rels_tags_id_idx" ON "venues_rels" USING btree ("tags_id");
  CREATE INDEX "hero_slides_image_idx" ON "hero_slides" USING btree ("image_id");
  CREATE INDEX "hero_slides_venue_idx" ON "hero_slides" USING btree ("venue_id");
  CREATE INDEX "hero_slides_context_idx" ON "hero_slides" USING btree ("context");
  CREATE INDEX "hero_slides_updated_at_idx" ON "hero_slides" USING btree ("updated_at");
  CREATE INDEX "hero_slides_created_at_idx" ON "hero_slides" USING btree ("created_at");
  CREATE UNIQUE INDEX "hero_slides_locales_locale_parent_id_unique" ON "hero_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "amenities_opening_hours_order_idx" ON "amenities_opening_hours" USING btree ("_order");
  CREATE INDEX "amenities_opening_hours_parent_id_idx" ON "amenities_opening_hours" USING btree ("_parent_id");
  CREATE INDEX "amenities_special_hours_order_idx" ON "amenities_special_hours" USING btree ("_order");
  CREATE INDEX "amenities_special_hours_parent_id_idx" ON "amenities_special_hours" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "amenities_special_hours_locales_locale_parent_id_unique" ON "amenities_special_hours_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "amenities__order_idx" ON "amenities" USING btree ("_order");
  CREATE UNIQUE INDEX "amenities_slug_idx" ON "amenities" USING btree ("slug");
  CREATE INDEX "amenities_image_idx" ON "amenities" USING btree ("image_id");
  CREATE INDEX "amenities_link_link_venue_idx" ON "amenities" USING btree ("link_venue_id");
  CREATE INDEX "amenities_updated_at_idx" ON "amenities" USING btree ("updated_at");
  CREATE INDEX "amenities_created_at_idx" ON "amenities" USING btree ("created_at");
  CREATE UNIQUE INDEX "amenities_locales_locale_parent_id_unique" ON "amenities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "amenities_rels_order_idx" ON "amenities_rels" USING btree ("order");
  CREATE INDEX "amenities_rels_parent_idx" ON "amenities_rels" USING btree ("parent_id");
  CREATE INDEX "amenities_rels_path_idx" ON "amenities_rels" USING btree ("path");
  CREATE INDEX "amenities_rels_faqs_id_idx" ON "amenities_rels" USING btree ("faqs_id");
  CREATE UNIQUE INDEX "faqs_slug_idx" ON "faqs" USING btree ("slug");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE UNIQUE INDEX "faqs_locales_locale_parent_id_unique" ON "faqs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "faqs_rels_order_idx" ON "faqs_rels" USING btree ("order");
  CREATE INDEX "faqs_rels_parent_idx" ON "faqs_rels" USING btree ("parent_id");
  CREATE INDEX "faqs_rels_path_idx" ON "faqs_rels" USING btree ("path");
  CREATE INDEX "faqs_rels_pages_id_idx" ON "faqs_rels" USING btree ("pages_id");
  CREATE UNIQUE INDEX "artists_slug_idx" ON "artists" USING btree ("slug");
  CREATE INDEX "artists_person_idx" ON "artists" USING btree ("person_id");
  CREATE INDEX "artists_portrait_idx" ON "artists" USING btree ("portrait_id");
  CREATE INDEX "artists_updated_at_idx" ON "artists" USING btree ("updated_at");
  CREATE INDEX "artists_created_at_idx" ON "artists" USING btree ("created_at");
  CREATE UNIQUE INDEX "artists_locales_locale_parent_id_unique" ON "artists_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "artists_rels_order_idx" ON "artists_rels" USING btree ("order");
  CREATE INDEX "artists_rels_parent_idx" ON "artists_rels" USING btree ("parent_id");
  CREATE INDEX "artists_rels_path_idx" ON "artists_rels" USING btree ("path");
  CREATE INDEX "artists_rels_tags_id_idx" ON "artists_rels" USING btree ("tags_id");
  CREATE INDEX "artworks_images_order_idx" ON "artworks_images" USING btree ("_order");
  CREATE INDEX "artworks_images_parent_id_idx" ON "artworks_images" USING btree ("_parent_id");
  CREATE INDEX "artworks_images_image_idx" ON "artworks_images" USING btree ("image_id");
  CREATE INDEX "artworks__order_idx" ON "artworks" USING btree ("_order");
  CREATE UNIQUE INDEX "artworks_slug_idx" ON "artworks" USING btree ("slug");
  CREATE INDEX "artworks_artist_idx" ON "artworks" USING btree ("artist_id");
  CREATE INDEX "artworks_updated_at_idx" ON "artworks" USING btree ("updated_at");
  CREATE INDEX "artworks_created_at_idx" ON "artworks" USING btree ("created_at");
  CREATE UNIQUE INDEX "artworks_locales_locale_parent_id_unique" ON "artworks_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "artworks_rels_order_idx" ON "artworks_rels" USING btree ("order");
  CREATE INDEX "artworks_rels_parent_idx" ON "artworks_rels" USING btree ("parent_id");
  CREATE INDEX "artworks_rels_path_idx" ON "artworks_rels" USING btree ("path");
  CREATE INDEX "artworks_rels_tags_id_idx" ON "artworks_rels" USING btree ("tags_id");
  CREATE UNIQUE INDEX "exhibitions_slug_idx" ON "exhibitions" USING btree ("slug");
  CREATE INDEX "exhibitions_venue_idx" ON "exhibitions" USING btree ("venue_id");
  CREATE INDEX "exhibitions_hero_image_idx" ON "exhibitions" USING btree ("hero_image_id");
  CREATE INDEX "exhibitions_updated_at_idx" ON "exhibitions" USING btree ("updated_at");
  CREATE INDEX "exhibitions_created_at_idx" ON "exhibitions" USING btree ("created_at");
  CREATE UNIQUE INDEX "exhibitions_locales_locale_parent_id_unique" ON "exhibitions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "exhibitions_rels_order_idx" ON "exhibitions_rels" USING btree ("order");
  CREATE INDEX "exhibitions_rels_parent_idx" ON "exhibitions_rels" USING btree ("parent_id");
  CREATE INDEX "exhibitions_rels_path_idx" ON "exhibitions_rels" USING btree ("path");
  CREATE INDEX "exhibitions_rels_artists_id_idx" ON "exhibitions_rels" USING btree ("artists_id");
  CREATE INDEX "exhibitions_rels_artworks_id_idx" ON "exhibitions_rels" USING btree ("artworks_id");
  CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");
  CREATE INDEX "events_venue_idx" ON "events" USING btree ("venue_id");
  CREATE INDEX "events_hero_image_idx" ON "events" USING btree ("hero_image_id");
  CREATE INDEX "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX "events_created_at_idx" ON "events" USING btree ("created_at");
  CREATE UNIQUE INDEX "events_locales_locale_parent_id_unique" ON "events_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "events_rels_order_idx" ON "events_rels" USING btree ("order");
  CREATE INDEX "events_rels_parent_idx" ON "events_rels" USING btree ("parent_id");
  CREATE INDEX "events_rels_path_idx" ON "events_rels" USING btree ("path");
  CREATE INDEX "events_rels_tags_id_idx" ON "events_rels" USING btree ("tags_id");
  CREATE INDEX "people_authority_identifier_order_idx" ON "people_authority_identifier" USING btree ("_order");
  CREATE INDEX "people_authority_identifier_parent_id_idx" ON "people_authority_identifier" USING btree ("_parent_id");
  CREATE INDEX "people_authority_same_as_order_idx" ON "people_authority_same_as" USING btree ("_order");
  CREATE INDEX "people_authority_same_as_parent_id_idx" ON "people_authority_same_as" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "people_slug_idx" ON "people" USING btree ("slug");
  CREATE INDEX "people_portrait_idx" ON "people" USING btree ("portrait_id");
  CREATE INDEX "people_related_venue_idx" ON "people" USING btree ("related_venue_id");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE UNIQUE INDEX "people_locales_locale_parent_id_unique" ON "people_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "people_rels_order_idx" ON "people_rels" USING btree ("order");
  CREATE INDEX "people_rels_parent_idx" ON "people_rels" USING btree ("parent_id");
  CREATE INDEX "people_rels_path_idx" ON "people_rels" USING btree ("path");
  CREATE INDEX "people_rels_tags_id_idx" ON "people_rels" USING btree ("tags_id");
  CREATE INDEX "neighbourhood_places_target_audience_order_idx" ON "neighbourhood_places_target_audience" USING btree ("_order");
  CREATE INDEX "neighbourhood_places_target_audience_parent_id_idx" ON "neighbourhood_places_target_audience" USING btree ("_parent_id");
  CREATE INDEX "neighbourhood_places_endorsements_order_idx" ON "neighbourhood_places_endorsements" USING btree ("_order");
  CREATE INDEX "neighbourhood_places_endorsements_parent_id_idx" ON "neighbourhood_places_endorsements" USING btree ("_parent_id");
  CREATE INDEX "neighbourhood_places_endorsements_person_idx" ON "neighbourhood_places_endorsements" USING btree ("person_id");
  CREATE INDEX "neighbourhood_places_authority_identifier_order_idx" ON "neighbourhood_places_authority_identifier" USING btree ("_order");
  CREATE INDEX "neighbourhood_places_authority_identifier_parent_id_idx" ON "neighbourhood_places_authority_identifier" USING btree ("_parent_id");
  CREATE INDEX "neighbourhood_places_authority_same_as_order_idx" ON "neighbourhood_places_authority_same_as" USING btree ("_order");
  CREATE INDEX "neighbourhood_places_authority_same_as_parent_id_idx" ON "neighbourhood_places_authority_same_as" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "neighbourhood_places_slug_idx" ON "neighbourhood_places" USING btree ("slug");
  CREATE INDEX "neighbourhood_places_image_idx" ON "neighbourhood_places" USING btree ("image_id");
  CREATE INDEX "neighbourhood_places_updated_at_idx" ON "neighbourhood_places" USING btree ("updated_at");
  CREATE INDEX "neighbourhood_places_created_at_idx" ON "neighbourhood_places" USING btree ("created_at");
  CREATE UNIQUE INDEX "neighbourhood_places_locales_locale_parent_id_unique" ON "neighbourhood_places_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "places_slug_idx" ON "places" USING btree ("slug");
  CREATE INDEX "places_image_idx" ON "places" USING btree ("image_id");
  CREATE INDEX "places_updated_at_idx" ON "places" USING btree ("updated_at");
  CREATE INDEX "places_created_at_idx" ON "places" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_rooms_id_idx" ON "payload_locked_documents_rels" USING btree ("rooms_id");
  CREATE INDEX "payload_locked_documents_rels_meeting_rooms_id_idx" ON "payload_locked_documents_rels" USING btree ("meeting_rooms_id");
  CREATE INDEX "payload_locked_documents_rels_meeting_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("meeting_documents_id");
  CREATE INDEX "payload_locked_documents_rels_meeting_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("meeting_inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_venues_id_idx" ON "payload_locked_documents_rels" USING btree ("venues_id");
  CREATE INDEX "payload_locked_documents_rels_hero_slides_id_idx" ON "payload_locked_documents_rels" USING btree ("hero_slides_id");
  CREATE INDEX "payload_locked_documents_rels_amenities_id_idx" ON "payload_locked_documents_rels" USING btree ("amenities_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_artists_id_idx" ON "payload_locked_documents_rels" USING btree ("artists_id");
  CREATE INDEX "payload_locked_documents_rels_artworks_id_idx" ON "payload_locked_documents_rels" USING btree ("artworks_id");
  CREATE INDEX "payload_locked_documents_rels_exhibitions_id_idx" ON "payload_locked_documents_rels" USING btree ("exhibitions_id");
  CREATE INDEX "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_neighbourhood_places_id_idx" ON "payload_locked_documents_rels" USING btree ("neighbourhood_places_id");
  CREATE INDEX "payload_locked_documents_rels_places_id_idx" ON "payload_locked_documents_rels" USING btree ("places_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "hotel_same_as_order_idx" ON "hotel_same_as" USING btree ("_order");
  CREATE INDEX "hotel_same_as_parent_id_idx" ON "hotel_same_as" USING btree ("_parent_id");
  CREATE INDEX "hotel_amenity_feature_order_idx" ON "hotel_amenity_feature" USING btree ("_order");
  CREATE INDEX "hotel_amenity_feature_parent_id_idx" ON "hotel_amenity_feature" USING btree ("_parent_id");
  CREATE INDEX "hotel_certifications_order_idx" ON "hotel_certifications" USING btree ("_order");
  CREATE INDEX "hotel_certifications_parent_id_idx" ON "hotel_certifications" USING btree ("_parent_id");
  CREATE INDEX "hotel_hours_order_idx" ON "hotel_hours" USING btree ("_order");
  CREATE INDEX "hotel_hours_parent_id_idx" ON "hotel_hours" USING btree ("_parent_id");
  CREATE INDEX "hotel_meet_and_work_slides_order_idx" ON "hotel_meet_and_work_slides" USING btree ("_order");
  CREATE INDEX "hotel_meet_and_work_slides_parent_id_idx" ON "hotel_meet_and_work_slides" USING btree ("_parent_id");
  CREATE INDEX "hotel_meet_and_work_slides_image_idx" ON "hotel_meet_and_work_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "hotel_meet_and_work_slides_locales_locale_parent_id_unique" ON "hotel_meet_and_work_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "hotel_hero_map_image_idx" ON "hotel" USING btree ("hero_map_image_id");
  CREATE INDEX "hotel_eat_and_drink_eat_and_drink_image_idx" ON "hotel" USING btree ("eat_and_drink_image_id");
  CREATE UNIQUE INDEX "hotel_locales_locale_parent_id_unique" ON "hotel_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "homepage_hero_slides_order_idx" ON "homepage_hero_slides" USING btree ("_order");
  CREATE INDEX "homepage_hero_slides_parent_id_idx" ON "homepage_hero_slides" USING btree ("_parent_id");
  CREATE INDEX "homepage_hero_slides_image_idx" ON "homepage_hero_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "homepage_hero_slides_locales_locale_parent_id_unique" ON "homepage_hero_slides_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "homepage_locales_locale_parent_id_unique" ON "homepage_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "navigation_secondary_links_order_idx" ON "navigation_secondary_links" USING btree ("_order");
  CREATE INDEX "navigation_secondary_links_parent_id_idx" ON "navigation_secondary_links" USING btree ("_parent_id");
  CREATE INDEX "navigation_secondary_links_page_idx" ON "navigation_secondary_links" USING btree ("page_id");
  CREATE INDEX "footer_contact_address_lines_order_idx" ON "footer_contact_address_lines" USING btree ("_order");
  CREATE INDEX "footer_contact_address_lines_parent_id_idx" ON "footer_contact_address_lines" USING btree ("_parent_id");
  CREATE INDEX "footer_contact_transit_lines_order_idx" ON "footer_contact_transit_lines" USING btree ("_order");
  CREATE INDEX "footer_contact_transit_lines_parent_id_idx" ON "footer_contact_transit_lines" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_contact_transit_lines_locales_locale_parent_id_unique" ON "footer_contact_transit_lines_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_links_internal_page_idx" ON "footer_columns_links" USING btree ("internal_page_id");
  CREATE UNIQUE INDEX "footer_columns_links_locales_locale_parent_id_unique" ON "footer_columns_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_columns_locales_locale_parent_id_unique" ON "footer_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_already_here_column_links_order_idx" ON "footer_already_here_column_links" USING btree ("_order");
  CREATE INDEX "footer_already_here_column_links_parent_id_idx" ON "footer_already_here_column_links" USING btree ("_parent_id");
  CREATE INDEX "footer_already_here_column_links_internal_page_idx" ON "footer_already_here_column_links" USING btree ("internal_page_id");
  CREATE UNIQUE INDEX "footer_already_here_column_links_locales_locale_parent_id_un" ON "footer_already_here_column_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_awards_order_idx" ON "footer_awards" USING btree ("_order");
  CREATE INDEX "footer_awards_parent_id_idx" ON "footer_awards" USING btree ("_parent_id");
  CREATE INDEX "footer_awards_image_idx" ON "footer_awards" USING btree ("image_id");
  CREATE UNIQUE INDEX "footer_awards_locales_locale_parent_id_unique" ON "footer_awards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_partner_links_order_idx" ON "footer_partner_links" USING btree ("_order");
  CREATE INDEX "footer_partner_links_parent_id_idx" ON "footer_partner_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_partner_links_locales_locale_parent_id_unique" ON "footer_partner_links_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_legal_links_locales_locale_parent_id_unique" ON "footer_legal_links_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "meetings_hero_slides_order_idx" ON "meetings_hero_slides" USING btree ("_order");
  CREATE INDEX "meetings_hero_slides_parent_id_idx" ON "meetings_hero_slides" USING btree ("_parent_id");
  CREATE INDEX "meetings_hero_slides_image_idx" ON "meetings_hero_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "meetings_hero_slides_locales_locale_parent_id_unique" ON "meetings_hero_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "meetings_event_types_order_idx" ON "meetings_event_types" USING btree ("_order");
  CREATE INDEX "meetings_event_types_parent_id_idx" ON "meetings_event_types" USING btree ("_parent_id");
  CREATE INDEX "meetings_event_types_image_idx" ON "meetings_event_types" USING btree ("image_id");
  CREATE UNIQUE INDEX "meetings_event_types_locales_locale_parent_id_unique" ON "meetings_event_types_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "meetings_facilities_order_idx" ON "meetings_facilities" USING btree ("_order");
  CREATE INDEX "meetings_facilities_parent_id_idx" ON "meetings_facilities" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "meetings_facilities_locales_locale_parent_id_unique" ON "meetings_facilities_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "meetings_hybrid_teaser_hybrid_teaser_image_idx" ON "meetings" USING btree ("hybrid_teaser_image_id");
  CREATE INDEX "meetings_food_drink_teaser_food_drink_teaser_image_idx" ON "meetings" USING btree ("food_drink_teaser_image_id");
  CREATE UNIQUE INDEX "meetings_locales_locale_parent_id_unique" ON "meetings_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "tags_locales" CASCADE;
  DROP TABLE "rooms_images" CASCADE;
  DROP TABLE "rooms" CASCADE;
  DROP TABLE "rooms_locales" CASCADE;
  DROP TABLE "rooms_rels" CASCADE;
  DROP TABLE "meeting_rooms_images" CASCADE;
  DROP TABLE "meeting_rooms_images_locales" CASCADE;
  DROP TABLE "meeting_rooms" CASCADE;
  DROP TABLE "meeting_rooms_locales" CASCADE;
  DROP TABLE "meeting_rooms_rels" CASCADE;
  DROP TABLE "meeting_documents" CASCADE;
  DROP TABLE "meeting_documents_locales" CASCADE;
  DROP TABLE "meeting_inquiries" CASCADE;
  DROP TABLE "venues_opening_hours" CASCADE;
  DROP TABLE "venues_images" CASCADE;
  DROP TABLE "venues_same_as" CASCADE;
  DROP TABLE "venues" CASCADE;
  DROP TABLE "venues_locales" CASCADE;
  DROP TABLE "venues_rels" CASCADE;
  DROP TABLE "hero_slides" CASCADE;
  DROP TABLE "hero_slides_locales" CASCADE;
  DROP TABLE "amenities_opening_hours" CASCADE;
  DROP TABLE "amenities_special_hours" CASCADE;
  DROP TABLE "amenities_special_hours_locales" CASCADE;
  DROP TABLE "amenities" CASCADE;
  DROP TABLE "amenities_locales" CASCADE;
  DROP TABLE "amenities_rels" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "faqs_locales" CASCADE;
  DROP TABLE "faqs_rels" CASCADE;
  DROP TABLE "artists" CASCADE;
  DROP TABLE "artists_locales" CASCADE;
  DROP TABLE "artists_rels" CASCADE;
  DROP TABLE "artworks_images" CASCADE;
  DROP TABLE "artworks" CASCADE;
  DROP TABLE "artworks_locales" CASCADE;
  DROP TABLE "artworks_rels" CASCADE;
  DROP TABLE "exhibitions" CASCADE;
  DROP TABLE "exhibitions_locales" CASCADE;
  DROP TABLE "exhibitions_rels" CASCADE;
  DROP TABLE "events" CASCADE;
  DROP TABLE "events_locales" CASCADE;
  DROP TABLE "events_rels" CASCADE;
  DROP TABLE "people_authority_identifier" CASCADE;
  DROP TABLE "people_authority_same_as" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "people_locales" CASCADE;
  DROP TABLE "people_rels" CASCADE;
  DROP TABLE "neighbourhood_places_target_audience" CASCADE;
  DROP TABLE "neighbourhood_places_endorsements" CASCADE;
  DROP TABLE "neighbourhood_places_authority_identifier" CASCADE;
  DROP TABLE "neighbourhood_places_authority_same_as" CASCADE;
  DROP TABLE "neighbourhood_places" CASCADE;
  DROP TABLE "neighbourhood_places_locales" CASCADE;
  DROP TABLE "places" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "hotel_same_as" CASCADE;
  DROP TABLE "hotel_amenity_feature" CASCADE;
  DROP TABLE "hotel_certifications" CASCADE;
  DROP TABLE "hotel_hours" CASCADE;
  DROP TABLE "hotel_meet_and_work_slides" CASCADE;
  DROP TABLE "hotel_meet_and_work_slides_locales" CASCADE;
  DROP TABLE "hotel" CASCADE;
  DROP TABLE "hotel_locales" CASCADE;
  DROP TABLE "homepage_hero_slides" CASCADE;
  DROP TABLE "homepage_hero_slides_locales" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_locales" CASCADE;
  DROP TABLE "navigation_secondary_links" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "footer_contact_address_lines" CASCADE;
  DROP TABLE "footer_contact_transit_lines" CASCADE;
  DROP TABLE "footer_contact_transit_lines_locales" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns_links_locales" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_columns_locales" CASCADE;
  DROP TABLE "footer_already_here_column_links" CASCADE;
  DROP TABLE "footer_already_here_column_links_locales" CASCADE;
  DROP TABLE "footer_awards" CASCADE;
  DROP TABLE "footer_awards_locales" CASCADE;
  DROP TABLE "footer_partner_links" CASCADE;
  DROP TABLE "footer_partner_links_locales" CASCADE;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "footer_legal_links_locales" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "meetings_hero_slides" CASCADE;
  DROP TABLE "meetings_hero_slides_locales" CASCADE;
  DROP TABLE "meetings_event_types" CASCADE;
  DROP TABLE "meetings_event_types_locales" CASCADE;
  DROP TABLE "meetings_facilities" CASCADE;
  DROP TABLE "meetings_facilities_locales" CASCADE;
  DROP TABLE "meetings" CASCADE;
  DROP TABLE "meetings_locales" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_tags_type";
  DROP TYPE "public"."enum_rooms_bed_configuration_type";
  DROP TYPE "public"."enum_rooms_bathroom_label";
  DROP TYPE "public"."enum_meeting_rooms_area";
  DROP TYPE "public"."enum_meeting_documents_category";
  DROP TYPE "public"."enum_meeting_documents_area";
  DROP TYPE "public"."enum_meeting_documents_page_role";
  DROP TYPE "public"."enum_meeting_inquiries_locale";
  DROP TYPE "public"."enum_venues_venue_type";
  DROP TYPE "public"."enum_hero_slides_context";
  DROP TYPE "public"."enum_amenities_special_hours_kind";
  DROP TYPE "public"."enum_amenities_kind";
  DROP TYPE "public"."enum_amenities_link_type";
  DROP TYPE "public"."enum_amenities_link_page";
  DROP TYPE "public"."enum_amenities_schema_type";
  DROP TYPE "public"."enum_faqs_context";
  DROP TYPE "public"."enum_faqs_category";
  DROP TYPE "public"."enum_artworks_artwork_type";
  DROP TYPE "public"."enum_artworks_visibility";
  DROP TYPE "public"."enum_artworks_location_in_building_floor";
  DROP TYPE "public"."enum_artworks_status";
  DROP TYPE "public"."enum_exhibitions_status";
  DROP TYPE "public"."enum_events_category";
  DROP TYPE "public"."enum_events_currency";
  DROP TYPE "public"."enum_people_authority_identifier_property_i_d";
  DROP TYPE "public"."enum_people_type";
  DROP TYPE "public"."enum_people_status";
  DROP TYPE "public"."enum_neighbourhood_places_authority_identifier_property_i_d";
  DROP TYPE "public"."enum_neighbourhood_places_category";
  DROP TYPE "public"."enum_neighbourhood_places_secondary_category";
  DROP TYPE "public"."enum_neighbourhood_places_schema_type";
  DROP TYPE "public"."enum_neighbourhood_places_distance_tier";
  DROP TYPE "public"."enum_neighbourhood_places_indoor_outdoor";
  DROP TYPE "public"."enum_neighbourhood_places_image_credit_license";
  DROP TYPE "public"."enum_neighbourhood_places_status";
  DROP TYPE "public"."enum_places_context";
  DROP TYPE "public"."enum_places_type";
  DROP TYPE "public"."enum_places_category";
  DROP TYPE "public"."enum_places_pin_icon";
  DROP TYPE "public"."enum_places_schema_type";
  DROP TYPE "public"."enum_pages_context";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum_homepage_hero_slides_kb_origin";
  DROP TYPE "public"."enum_footer_columns_links_link_type";
  DROP TYPE "public"."enum_footer_already_here_column_links_link_type";`)
}
