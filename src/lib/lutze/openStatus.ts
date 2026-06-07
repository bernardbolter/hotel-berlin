export type StatusType = 'closed' | 'open' | 'bar-only' | 'closing'

export type StatusResult = {
  type: StatusType
  text: string
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
    return { type: 'closed', text: 'Opens today at 10:00' }
  }

  if (time < toMinutes(11, 30)) {
    return { type: 'open', text: 'Open now — bar · kitchen opens 11:30' }
  }

  if (time < toMinutes(15, 0)) {
    return { type: 'open', text: 'Open now — kitchen & bar' }
  }

  if (time < toMinutes(17, 0)) {
    return { type: 'bar-only', text: 'Open — bar only · kitchen reopens 17:00' }
  }

  if (time < toMinutes(22, 0)) {
    return { type: 'open', text: 'Open now — kitchen & bar' }
  }

  if (time < toMinutes(22, 30)) {
    return { type: 'closing', text: 'Kitchen closing soon · bar stays open' }
  }

  return { type: 'bar-only', text: 'Open — bar until late' }
}
