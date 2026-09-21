import * as migration_20260921_090837_baseline from './20260921_090837_baseline';

export const migrations = [
  {
    up: migration_20260921_090837_baseline.up,
    down: migration_20260921_090837_baseline.down,
    name: '20260921_090837_baseline'
  },
];
