/**
 * Recursively removes `undefined`, `null`, empty strings, empty arrays and
 * empty objects from a value.
 *
 * Why this exists: schema.org / Google's structured-data parsers treat a
 * present-but-empty property inconsistently (some tolerate it, some flag it
 * as a validation warning). Every builder in this library is written
 * "optimistically" — it fills in every field it has data for — and relies
 * on `prune` as the single place that decides what actually gets omitted.
 * This keeps the builders themselves free of scattered `if (x) {...}`
 * conditionals, which is where fields quietly get forgotten.
 */
export function prune<T>(value: T): T {
  if (Array.isArray(value)) {
    const cleaned = value.map((item) => prune(item)).filter((item) => !isEmpty(item));
    return cleaned as unknown as T;
  }

  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const cleanedVal = prune(val);
      if (!isEmpty(cleanedVal)) {
        out[key] = cleanedVal;
      }
    }
    return out as unknown as T;
  }

  return value;
}

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value as object).length === 0) return true;
  return false;
}
