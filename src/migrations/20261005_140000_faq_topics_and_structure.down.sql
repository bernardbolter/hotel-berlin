
ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_faq_topics_fk";
DROP INDEX IF EXISTS "payload_locked_documents_rels_faq_topics_id_idx";
ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "faq_topics_id";

ALTER TABLE "faqs_rels" DROP CONSTRAINT IF EXISTS "faqs_rels_faq_topics_fk";
ALTER TABLE "faqs_rels" DROP CONSTRAINT IF EXISTS "faqs_rels_rooms_fk";
ALTER TABLE "faqs_rels" DROP CONSTRAINT IF EXISTS "faqs_rels_meeting_rooms_fk";
ALTER TABLE "faqs_rels" DROP CONSTRAINT IF EXISTS "faqs_rels_venues_fk";
DROP INDEX IF EXISTS "faqs_rels_faq_topics_id_idx";
DROP INDEX IF EXISTS "faqs_rels_rooms_id_idx";
DROP INDEX IF EXISTS "faqs_rels_meeting_rooms_id_idx";
DROP INDEX IF EXISTS "faqs_rels_venues_id_idx";
ALTER TABLE "faqs_rels" DROP COLUMN IF EXISTS "faq_topics_id";
ALTER TABLE "faqs_rels" DROP COLUMN IF EXISTS "rooms_id";
ALTER TABLE "faqs_rels" DROP COLUMN IF EXISTS "meeting_rooms_id";
ALTER TABLE "faqs_rels" DROP COLUMN IF EXISTS "venues_id";

ALTER TABLE "faqs" DROP CONSTRAINT IF EXISTS "faqs_topic_id_faq_topics_id_fk";
ALTER TABLE "faqs" DROP CONSTRAINT IF EXISTS "faqs_merged_into_id_faqs_id_fk";
DROP INDEX IF EXISTS "faqs_topic_idx";
DROP INDEX IF EXISTS "faqs_merged_into_idx";
DROP INDEX IF EXISTS "faqs__status_idx";
ALTER TABLE "faqs" DROP COLUMN IF EXISTS "audience";
ALTER TABLE "faqs" DROP COLUMN IF EXISTS "topic_id";
ALTER TABLE "faqs" DROP COLUMN IF EXISTS "priority";
ALTER TABLE "faqs" DROP COLUMN IF EXISTS "merged_into_id";
ALTER TABLE "faqs" DROP COLUMN IF EXISTS "internal_note";
ALTER TABLE "faqs" DROP COLUMN IF EXISTS "source";
ALTER TABLE "faqs" DROP COLUMN IF EXISTS "last_reviewed";
ALTER TABLE "faqs" DROP COLUMN IF EXISTS "_status";

-- restore NOT NULL as before drafts (best-effort)
ALTER TABLE "faqs" ALTER COLUMN "context" SET NOT NULL;
ALTER TABLE "faqs" ALTER COLUMN "category" SET NOT NULL;
ALTER TABLE "faqs" ALTER COLUMN "order" SET NOT NULL;
ALTER TABLE "faqs" ALTER COLUMN "slug" SET NOT NULL;

DROP TABLE IF EXISTS "_faqs_v_version_pinned_routes" CASCADE;
DROP TABLE IF EXISTS "_faqs_v_version_alias_slugs" CASCADE;
DROP TABLE IF EXISTS "_faqs_v_rels" CASCADE;
DROP TABLE IF EXISTS "_faqs_v_locales" CASCADE;
DROP TABLE IF EXISTS "_faqs_v" CASCADE;
DROP TABLE IF EXISTS "faqs_pinned_routes" CASCADE;
DROP TABLE IF EXISTS "faqs_alias_slugs" CASCADE;
DROP TABLE IF EXISTS "faq_topics_locales" CASCADE;
DROP TABLE IF EXISTS "faq_topics" CASCADE;

DROP TYPE IF EXISTS "public"."enum__faqs_v_published_locale";
DROP TYPE IF EXISTS "public"."enum__faqs_v_version_audience";
DROP TYPE IF EXISTS "public"."enum__faqs_v_version_category";
DROP TYPE IF EXISTS "public"."enum__faqs_v_version_context";
DROP TYPE IF EXISTS "public"."enum__faqs_v_version_pinned_routes";
DROP TYPE IF EXISTS "public"."enum__faqs_v_version_priority";
DROP TYPE IF EXISTS "public"."enum__faqs_v_version_source";
DROP TYPE IF EXISTS "public"."enum__faqs_v_version_status";
DROP TYPE IF EXISTS "public"."enum_faqs_audience";
DROP TYPE IF EXISTS "public"."enum_faqs_pinned_routes";
DROP TYPE IF EXISTS "public"."enum_faqs_priority";
DROP TYPE IF EXISTS "public"."enum_faqs_source";
DROP TYPE IF EXISTS "public"."enum_faqs_status";
