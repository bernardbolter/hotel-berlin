/**
 * Dark-launch flag for getFAQsForRoute on existing surfaces.
 * Default OFF — pages stay on the legacy getFaqs / getRelevantFaqs paths.
 */
export function isFaqRoutingV2(): boolean {
  const raw = process.env.FAQ_ROUTING_V2
  if (raw == null || raw === '') return false
  return raw === '1' || raw.toLowerCase() === 'true' || raw.toLowerCase() === 'yes'
}
