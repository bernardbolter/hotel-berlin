import * as migration_20260921_090837_baseline from './20260921_090837_baseline';
import * as migration_20260921_105545_add_user_role from './20260921_105545_add_user_role';
import * as migration_20260921_110650_add_legal_documents from './20260921_110650_add_legal_documents';

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
    name: '20260921_110650_add_legal_documents'
  },
];
