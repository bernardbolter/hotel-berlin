import * as migration_20260921_090837_baseline from './20260921_090837_baseline'
import * as migration_20260921_105545_add_user_role from './20260921_105545_add_user_role'
import * as migration_20260921_110650_add_legal_documents from './20260921_110650_add_legal_documents'
import * as migration_20260921_111010_add_venue_special_hours from './20260921_111010_add_venue_special_hours'
import * as migration_20260928_134900_add_media_image_sizes from './20260928_134900_add_media_image_sizes'
import * as migration_20260929_123200_media_alt_en_from_existing from './20260929_123200_media_alt_en_from_existing'
import * as migration_20260930_111500_art_programme_a1 from './20260930_111500_art_programme_a1'
import * as migration_20261001_120000_guided_entry_step2 from './20261001_120000_guided_entry_step2'
import * as migration_20261001_180000_localize_artwork_medium_surface from './20261001_180000_localize_artwork_medium_surface'
import * as migration_20261001_190000_add_subject_tag_type from './20261001_190000_add_subject_tag_type'
import * as migration_20261001_220000_hero_slides_aeo_fields from './20261001_220000_hero_slides_aeo_fields'
import * as migration_20261001_230000_hero_slides_localize_ai_notes from './20261001_230000_hero_slides_localize_ai_notes'

export const migrations = [
  {
    up: migration_20260921_090837_baseline.up,
    down: migration_20260921_090837_baseline.down,
    name: '20260921_090837_baseline',
  },
  {
    up: migration_20260921_105545_add_user_role.up,
    down: migration_20260921_105545_add_user_role.down,
    name: '20260921_105545_add_user_role',
  },
  {
    up: migration_20260921_110650_add_legal_documents.up,
    down: migration_20260921_110650_add_legal_documents.down,
    name: '20260921_110650_add_legal_documents',
  },
  {
    up: migration_20260921_111010_add_venue_special_hours.up,
    down: migration_20260921_111010_add_venue_special_hours.down,
    name: '20260921_111010_add_venue_special_hours',
  },
  {
    up: migration_20260928_134900_add_media_image_sizes.up,
    down: migration_20260928_134900_add_media_image_sizes.down,
    name: '20260928_134900_add_media_image_sizes',
  },
  {
    up: migration_20260929_123200_media_alt_en_from_existing.up,
    down: migration_20260929_123200_media_alt_en_from_existing.down,
    name: '20260929_123200_media_alt_en_from_existing',
  },
  {
    up: migration_20260930_111500_art_programme_a1.up,
    down: migration_20260930_111500_art_programme_a1.down,
    name: '20260930_111500_art_programme_a1',
  },
  {
    up: migration_20261001_120000_guided_entry_step2.up,
    down: migration_20261001_120000_guided_entry_step2.down,
    name: '20261001_120000_guided_entry_step2',
  },
  {
    up: migration_20261001_180000_localize_artwork_medium_surface.up,
    down: migration_20261001_180000_localize_artwork_medium_surface.down,
    name: '20261001_180000_localize_artwork_medium_surface',
  },
  {
    up: migration_20261001_190000_add_subject_tag_type.up,
    down: migration_20261001_190000_add_subject_tag_type.down,
    name: '20261001_190000_add_subject_tag_type',
  },
  {
    up: migration_20261001_220000_hero_slides_aeo_fields.up,
    down: migration_20261001_220000_hero_slides_aeo_fields.down,
    name: '20261001_220000_hero_slides_aeo_fields',
  },
  {
    up: migration_20261001_230000_hero_slides_localize_ai_notes.up,
    down: migration_20261001_230000_hero_slides_localize_ai_notes.down,
    name: '20261001_230000_hero_slides_localize_ai_notes',
  },
]
