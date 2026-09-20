import * as migration_20260920_172150_baseline from './20260920_172150_baseline';

export const migrations = [
  {
    up: migration_20260920_172150_baseline.up,
    down: migration_20260920_172150_baseline.down,
    name: '20260920_172150_baseline'
  },
];
