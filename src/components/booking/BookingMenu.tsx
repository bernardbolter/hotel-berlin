'use client'

import { Baby, BedDouble, Clock, Timer, Users, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'

import { DateCard } from '@/components/booking/DateCard'
import {
  addDaysIso,
  buildMeetingPackageUrl,
  buildRadissonBookingUrl,
  compareIsoDates,
  getGaLinkerParam,
  MEETING_LENGTH_HOURS,
  meetingTimeOptions,
  openBookingHandoff,
  type BookingLocale,
  type MeetingLength,
} from '@/lib/booking'
import { meetingRequestPath } from '@/lib/meetings/meetingPage'

type Tab = 'rooms' | 'events'

type BookNowButtonProps = {
  open: boolean
  label: string
  controlsId: string
  onToggle: () => void
  className?: string
}

const selectClass =
  'mt-1 w-full appearance-none border-0 border-b border-hbb-black/20 bg-transparent py-2 pr-7 font-ui text-ui-md text-hbb-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctx-accent'
const labelClass = 'font-ui text-ui-sm font-medium text-hbb-black'
const submitClass =
  'inline-flex w-full items-center justify-center bg-hbb-black px-5 py-3.5 font-ui text-ui-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'

export function BookNowButton({
  open,
  label,
  controlsId,
  onToggle,
  className = 'inline-flex',
}: BookNowButtonProps) {
  const tc = useTranslations('common')

  return (
    <button
      type="button"
      className={`${className} book-now-btn`}
      aria-expanded={open}
      aria-controls={controlsId}
      aria-haspopup="dialog"
      aria-label={`${label} — ${tc('hotelName')}`}
      onClick={onToggle}
    >
      <span className="book-now-btn__text">{label}</span>
      <span className="book-now-btn__line" aria-hidden="true" />
    </button>
  )
}

type BookingPanelProps = {
  open: boolean
  panelId: string
  todayIso: string
  onClose: () => void
}

export function BookingPanel({ open, panelId, todayIso, onClose }: BookingPanelProps) {
  const t = useTranslations('booking')
  const locale = useLocale() as BookingLocale
  const headingId = useId()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [tab, setTab] = useState<Tab>('rooms')

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        type="button"
        tabIndex={-1}
        aria-label={t('close')}
        className="absolute inset-0 bg-hbb-black/40"
        onClick={onClose}
      />
      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="absolute inset-y-0 right-0 flex w-full max-w-[28rem] flex-col bg-white shadow-[0_0_40px_rgba(20,20,20,0.18)]"
      >
        <div className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-hbb-black/10 bg-white px-5 pt-4">
          <div role="tablist" aria-label={t('tabsAria')} className="flex min-w-0 flex-1">
            <TabButton
              selected={tab === 'rooms'}
              onSelect={() => setTab('rooms')}
              controls="booking-panel-rooms"
            >
              {t('roomsTab')}
            </TabButton>
            <TabButton
              selected={tab === 'events'}
              onSelect={() => setTab('events')}
              controls="booking-panel-events"
            >
              {t('eventsTab')}
            </TabButton>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="mb-1 inline-flex size-10 shrink-0 items-center justify-center text-hbb-black"
            aria-label={t('close')}
          >
            <X className="size-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <h2 id={headingId} className="font-ui text-[1.25rem] font-semibold leading-snug text-hbb-black">
            {tab === 'rooms' ? t('roomsHeading') : t('eventsHeading')}
          </h2>

          {tab === 'rooms' ? (
            <RoomsForm locale={locale} todayIso={todayIso} labelledBy={headingId} />
          ) : (
            <EventsForm locale={locale} todayIso={todayIso} labelledBy={headingId} />
          )}
        </div>
      </div>
    </div>
  )
}

function TabButton({
  selected,
  onSelect,
  controls,
  children,
}: {
  selected: boolean
  onSelect: () => void
  controls: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls={controls}
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      className={[
        'relative min-h-11 flex-1 px-2 font-ui text-ui-sm font-medium uppercase tracking-ui-wide',
        selected ? 'text-hbb-black' : 'text-hbb-nav-muted',
        "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-hbb-black after:content-['']",
        selected ? 'after:opacity-100' : 'after:opacity-0',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function RoomsForm({
  locale,
  todayIso,
  labelledBy,
}: {
  locale: BookingLocale
  todayIso: string
  labelledBy: string
}) {
  const t = useTranslations('booking')
  const [checkin, setCheckin] = useState(todayIso)
  const [checkout, setCheckout] = useState(addDaysIso(todayIso, 1))
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)

  function onCheckin(next: string) {
    setCheckin(next)
    if (compareIsoDates(next, checkout) >= 0) {
      setCheckout(addDaysIso(next, 1))
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const url = buildRadissonBookingUrl({
      checkin,
      checkout,
      adults,
      children,
      rooms,
      locale,
      ga: getGaLinkerParam(),
    })
    openBookingHandoff(url)
  }

  return (
    <form
      id="booking-panel-rooms"
      role="tabpanel"
      aria-labelledby={labelledBy}
      onSubmit={onSubmit}
      className="mt-5 space-y-5"
    >
      <div className="grid grid-cols-2 gap-4">
        <DateCard id="booking-checkin" label={t('checkIn')} value={checkin} min={todayIso} onChange={onCheckin} />
        <DateCard
          id="booking-checkout"
          label={t('checkOut')}
          value={checkout}
          min={addDaysIso(checkin, 1)}
          onChange={setCheckout}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <IconSelect
          id="booking-adults"
          label={t('adults')}
          icon={<Users className="size-4" strokeWidth={1.6} />}
          value={adults}
          onChange={setAdults}
        >
          {range(1, 10).map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </IconSelect>
        <IconSelect
          id="booking-children"
          label={t('children')}
          icon={<Baby className="size-4" strokeWidth={1.6} />}
          value={children}
          onChange={setChildren}
        >
          {range(0, 10).map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </IconSelect>
        <IconSelect
          id="booking-rooms"
          label={t('rooms')}
          icon={<BedDouble className="size-4" strokeWidth={1.6} />}
          value={rooms}
          onChange={setRooms}
        >
          {range(1, 5).map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </IconSelect>
      </div>

      <button type="submit" className={submitClass}>
        {t('submitRooms')}
        <span className="sr-only"> {t('opensNewTab')}</span>
      </button>
    </form>
  )
}

function EventsForm({
  locale,
  todayIso,
  labelledBy,
}: {
  locale: BookingLocale
  todayIso: string
  labelledBy: string
}) {
  const t = useTranslations('booking')
  const times = meetingTimeOptions()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [meetingLength, setMeetingLength] = useState<MeetingLength>('8')
  const [delegates, setDelegates] = useState('')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!date) {
      setError(t('eventsDateRequired'))
      return
    }
    const count = Number.parseInt(delegates, 10)
    if (!Number.isInteger(count) || count < 1) {
      setError(t('delegatesRequired'))
      return
    }
    setError(null)
    const url = buildMeetingPackageUrl({
      date,
      time,
      meetingLength,
      delegates: count,
      locale,
    })
    openBookingHandoff(url)
  }

  return (
    <form
      id="booking-panel-events"
      role="tabpanel"
      aria-labelledby={labelledBy}
      onSubmit={onSubmit}
      noValidate
      className="mt-5 space-y-5"
    >
      {error ? (
        <p className="font-ui text-ui-sm text-hbb-coral" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <DateCard id="booking-event-date" label={t('date')} value={date} min={todayIso} onChange={setDate} />
        <div className="min-w-0">
          <label htmlFor="booking-event-time" className={labelClass}>
            {t('time')}
          </label>
          <div className="relative">
            <select
              id="booking-event-time"
              className={selectClass}
              value={time}
              onChange={(event) => setTime(event.target.value)}
            >
              {times.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <Clock className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-hbb-black" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="min-w-0">
          <label htmlFor="booking-event-length" className={labelClass}>
            {t('meetingLength')}
          </label>
          <div className="relative">
            <select
              id="booking-event-length"
              className={selectClass}
              value={meetingLength}
              onChange={(event) => setMeetingLength(event.target.value as MeetingLength)}
            >
              {MEETING_LENGTH_HOURS.map((hours) => (
                <option key={hours} value={String(hours)}>
                  {t('hours', { count: hours })}
                </option>
              ))}
              <option value="Overnight">{t('overnight')}</option>
              <option value="Two-Days">{t('twoDays')}</option>
            </select>
            <Timer className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-hbb-black" />
          </div>
        </div>
        <div className="min-w-0">
          <label htmlFor="booking-event-delegates" className={labelClass}>
            {t('delegates')}
          </label>
          <input
            id="booking-event-delegates"
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            required
            value={delegates}
            onChange={(event) => setDelegates(event.target.value)}
            placeholder={t('delegatesPlaceholder')}
            className={`${selectClass} [appearance:textfield]`}
          />
        </div>
      </div>

      <button type="submit" className={submitClass}>
        {t('submitEvents')}
        <span className="sr-only"> {t('opensNewTab')}</span>
      </button>

      <p className="font-ui text-ui-sm leading-relaxed text-hbb-nav-secondary">
        {t('inquiryHint')}{' '}
        <a
          href={meetingRequestPath(locale)}
          className="font-medium text-hbb-black underline decoration-hbb-black/30 underline-offset-2 hover:decoration-hbb-black"
        >
          {t('inquiryLink')}
        </a>
      </p>
    </form>
  )
}

function IconSelect({
  id,
  label,
  icon,
  value,
  onChange,
  children,
}: {
  id: string
  label: string
  icon: ReactNode
  value: number
  onChange: (value: number) => void
  children: ReactNode
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className={selectClass}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-hbb-black">
          {icon}
        </span>
      </div>
    </div>
  )
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index)
}
