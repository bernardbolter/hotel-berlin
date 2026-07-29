import type { Authority } from '../types.js';

/**
 * Turns the Payload `authority` group into the two schema.org mechanisms
 * that actually carry the signal:
 *
 *  - `sameAs`     — full URLs asserting "this is the same entity"
 *                   (Wikipedia page, Wikidata entity page, verified socials)
 *  - `identifier` — structured {propertyID, value} pairs for authority
 *                   databases (Wikidata QID, GND, VIAF, Google KG/Place ID)
 *
 * Both are genuinely optional per record — most places/people won't have
 * either at launch. Returning `undefined` (rather than empty arrays) lets
 * `prune()` drop the key entirely instead of shipping `"sameAs": []`.
 */
export function buildAuthorityProps(authority: Authority | undefined): {
  sameAs?: string[];
  identifier?: { '@type': 'PropertyValue'; propertyID: string; value: string }[];
} {
  if (!authority) return {};

  const sameAs = authority.sameAs && authority.sameAs.length > 0 ? authority.sameAs : undefined;

  const identifier =
    authority.identifier && authority.identifier.length > 0
      ? authority.identifier.map((id) => ({
          '@type': 'PropertyValue' as const,
          propertyID: id.propertyID,
          value: id.value,
        }))
      : undefined;

  return { sameAs, identifier };
}
