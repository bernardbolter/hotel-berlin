import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prune } from '../src/lib/prune';

test('prune drops undefined, null, empty string, empty array, empty object', () => {
  const input = {
    a: 'keep',
    b: undefined,
    c: null,
    d: '',
    e: [],
    f: {},
    g: { nested: undefined, keep: 'yes' },
    h: ['x', undefined, ''],
  };

  assert.deepEqual(prune(input), {
    a: 'keep',
    g: { keep: 'yes' },
    h: ['x'],
  });
});

test('prune keeps falsy-but-meaningful values (0, false)', () => {
  const input = { count: 0, active: false, name: 'x' };
  assert.deepEqual(prune(input), { count: 0, active: false, name: 'x' });
});

test('prune recurses through arrays of objects', () => {
  const input = { list: [{ a: 1, b: undefined }, { a: 2 }] };
  assert.deepEqual(prune(input), { list: [{ a: 1 }, { a: 2 }] });
});
