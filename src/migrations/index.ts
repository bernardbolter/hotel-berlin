import * as migration_20260919_122612_baseline from './20260919_122612_baseline';
import * as migration_20260920_095241_add_user_role from './20260920_095241_add_user_role';
import * as migration_20260920_110409_add_amenities_and_special_hours from './20260920_110409_add_amenities_and_special_hours';
import * as migration_20260920_143000_amenities_fullpages from './20260920_143000_amenities_fullpages';

export const migrations = [
  {
    up: migration_20260919_122612_baseline.up,
    down: migration_20260919_122612_baseline.down,
    name: '20260919_122612_baseline',
  },
  {
    up: migration_20260920_095241_add_user_role.up,
    down: migration_20260920_095241_add_user_role.down,
    name: '20260920_095241_add_user_role',
  },
  {
    up: migration_20260920_110409_add_amenities_and_special_hours.up,
    down: migration_20260920_110409_add_amenities_and_special_hours.down,
    name: '20260920_110409_add_amenities_and_special_hours'
  },
  {
    up: migration_20260920_143000_amenities_fullpages.up,
    down: migration_20260920_143000_amenities_fullpages.down,
    name: '20260920_143000_amenities_fullpages',
  },
];
