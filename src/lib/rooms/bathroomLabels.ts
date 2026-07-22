export const bathroomLabels: Record<string, { en: string; de: string }> = {
  shower: { en: 'Shower', de: 'Dusche' },
  'rain-shower': { en: 'Rain shower', de: 'Regendusche' },
  'bath-shower': { en: 'Bath & shower', de: 'Bad & Dusche' },
  'spa-bathroom': { en: 'Spa bathroom', de: 'Spa-Bad' },
}

export function getBathroomLabel(
  key: string | null | undefined,
  locale: string,
): string {
  if (!key) return ''
  const labels = bathroomLabels[key]
  if (!labels) return ''
  return locale === 'de' ? labels.de : labels.en
}
