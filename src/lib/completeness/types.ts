/**
 * Shared completeness rules for the admin assistant (sidebar, guided entry,
 * needs-attention). Pure functions — no AI, no network.
 *
 * One definition of “complete”, used everywhere the brief names.
 */

export type CompletenessLocale = 'de' | 'en'

export type CompletenessSeverity = 'blocking' | 'warning'

export type CompletenessIssue = {
  /** Stable machine key, e.g. `artwork.photo`. */
  code: string
  severity: CompletenessSeverity
  /** Dot path useful for focusing a field in the admin UI. */
  field: string
  message: Record<CompletenessLocale, string>
}

export type CompletenessResult = {
  /** True when there are no blocking issues. */
  complete: boolean
  issues: CompletenessIssue[]
  blocking: CompletenessIssue[]
  warnings: CompletenessIssue[]
}

export function partitionIssues(issues: CompletenessIssue[]): CompletenessResult {
  const blocking = issues.filter((i) => i.severity === 'blocking')
  const warnings = issues.filter((i) => i.severity === 'warning')
  return {
    complete: blocking.length === 0,
    issues,
    blocking,
    warnings,
  }
}

export function issueMessages(
  issues: CompletenessIssue[],
  locale: CompletenessLocale = 'de',
): string[] {
  return issues.map((i) => i.message[locale])
}

/** Human list for publish-blocked toasts: names exactly what is missing. */
export function formatMissingList(
  issues: CompletenessIssue[],
  locale: CompletenessLocale = 'de',
): string {
  const msgs = issueMessages(issues.filter((i) => i.severity === 'blocking'), locale)
  if (msgs.length === 0) return ''
  if (msgs.length === 1) return msgs[0]!
  if (locale === 'de') {
    return msgs.slice(0, -1).join(', ') + ' und ' + msgs[msgs.length - 1]
  }
  return msgs.slice(0, -1).join(', ') + ' and ' + msgs[msgs.length - 1]
}
