export type StatusType = 'closed' | 'open' | 'bar-only' | 'closing'

export type StatusMessageKey =
  | 'beforeTen'
  | 'barBeforeKitchen'
  | 'kitchenAndBar'
  | 'barOnlyReopens'
  | 'kitchenClosing'
  | 'barLate'

export type StatusResult = {
  type: StatusType
  messageKey: StatusMessageKey
}

function getBerlinHourMinute(): { hour: number; minute: number } {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Berlin',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  })

  const parts = formatter.formatToParts(new Date())
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)

  return { hour, minute }
}

function toMinutes(hour: number, minute: number): number {
  return hour * 60 + minute
}

export function getStatus(): StatusResult {
  const { hour, minute } = getBerlinHourMinute()
  const time = toMinutes(hour, minute)

  if (time < toMinutes(10, 0)) {
    return { type: 'closed', messageKey: 'beforeTen' }
  }

  if (time < toMinutes(11, 30)) {
    return { type: 'open', messageKey: 'barBeforeKitchen' }
  }

  if (time < toMinutes(15, 0)) {
    return { type: 'open', messageKey: 'kitchenAndBar' }
  }

  if (time < toMinutes(17, 0)) {
    return { type: 'bar-only', messageKey: 'barOnlyReopens' }
  }

  if (time < toMinutes(22, 0)) {
    return { type: 'open', messageKey: 'kitchenAndBar' }
  }

  if (time < toMinutes(22, 30)) {
    return { type: 'closing', messageKey: 'kitchenClosing' }
  }

  return { type: 'bar-only', messageKey: 'barLate' }
}
