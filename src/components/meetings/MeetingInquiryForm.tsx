'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/routing'

type RoomOption = { id: number; slug: string; name: string }
type EventOption = { value: string; label: string }

type Props = {
  locale: 'de' | 'en'
  eventTypeOptions: EventOption[]
  roomOptions: RoomOption[]
  preselectedRoomSlug?: string
  /** When true, success state skips the “back to meetings” link. */
  embedded?: boolean
}

type FormState = {
  company: string
  contactPerson: string
  email: string
  phone: string
  startDate: string
  endDate: string
  eventType: string
  guestCount: string
  roomCount: string
  overnightGuestCount: string
  stayDuration: string
  roomSlug: string
  isRoomBlock: boolean
  notes: string
  privacyAccepted: boolean
  consentGiven: boolean
}

export function MeetingInquiryForm({
  locale,
  eventTypeOptions,
  roomOptions,
  preselectedRoomSlug,
  embedded = false,
}: Props) {
  const t = useTranslations('meetingsPage.request')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<FormState>({
    company: '',
    contactPerson: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    eventType: '',
    guestCount: '',
    roomCount: '',
    overnightGuestCount: '',
    stayDuration: '',
    roomSlug: preselectedRoomSlug ?? '',
    isRoomBlock: false,
    notes: '',
    privacyAccepted: false,
    consentGiven: false,
  })

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function validate(): Record<string, string> {
    const errors: Record<string, string> = {}
    if (!form.contactPerson.trim()) errors.contactPerson = t('errors.required')
    if (!form.email.trim()) errors.email = t('errors.required')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = t('errors.email')
    if (!form.phone.trim()) errors.phone = t('errors.required')
    if (!form.startDate) errors.startDate = t('errors.required')
    if (!form.endDate) errors.endDate = t('errors.required')
    if (!form.eventType) errors.eventType = t('errors.required')
    if (!form.privacyAccepted) errors.privacyAccepted = t('errors.consent')
    if (!form.consentGiven) errors.consentGiven = t('errors.consent')
    return errors
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setStatus('error')
      setErrorMessage(t('errors.form'))
      return
    }

    setStatus('submitting')
    setErrorMessage(null)

    try {
      const room = roomOptions.find((r) => r.slug === form.roomSlug)
      const res = await fetch('/api/meeting-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: form.company || undefined,
          contactPerson: form.contactPerson,
          email: form.email,
          phone: form.phone,
          startDate: form.startDate,
          endDate: form.endDate,
          eventType: form.eventType,
          guestCount: form.guestCount ? Number(form.guestCount) : undefined,
          roomCount: form.roomCount ? Number(form.roomCount) : undefined,
          overnightGuestCount: form.overnightGuestCount
            ? Number(form.overnightGuestCount)
            : undefined,
          stayDuration: form.stayDuration || undefined,
          roomOfInterest: room?.id,
          isRoomBlock: form.isRoomBlock,
          notes: form.notes || undefined,
          privacyAccepted: form.privacyAccepted,
          consentGiven: form.consentGiven,
          locale,
        }),
      })

      if (!res.ok) {
        throw new Error('submit failed')
      }

      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMessage(t('errors.submit'))
    }
  }

  if (status === 'success') {
    return (
      <div
        className="rounded-[3px] border border-hbb-teal bg-white p-8"
        role="status"
      >
        <h3 className="font-ui text-xl font-bold text-hbb-black">{t('successTitle')}</h3>
        <p className="mt-2 font-serif text-serif-md text-[var(--body-text)]">{t('successBody')}</p>
        {!embedded ? (
          <Link href="/meetings" className="mt-6 inline-flex font-ui text-ui-sm font-bold text-hbb-teal">
            {t('backToMeetings')}
          </Link>
        ) : null}
      </div>
    )
  }

  const inputClass =
    'mt-1 w-full border border-[var(--rule)] bg-white px-3 py-2.5 font-ui text-ui-sm text-hbb-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hbb-teal'

  const canSubmit =
    form.privacyAccepted && form.consentGiven && status !== 'submitting'

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-10">
      <div aria-live="polite" className="sr-only">
        {errorMessage}
      </div>
      {errorMessage ? (
        <p className="font-ui text-ui-sm text-hbb-coral" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <fieldset className="space-y-4">
        <legend className="font-ui text-lg font-bold text-hbb-black">{t('companyLegend')}</legend>
        <div>
          <label htmlFor="company" className="font-ui text-ui-sm text-[var(--dim)]">
            {t('company')}
          </label>
          <input
            id="company"
            name="company"
            className={inputClass}
            value={form.company}
            onChange={(e) => update('company', e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="contactPerson" className="font-ui text-ui-sm text-[var(--dim)]">
            {t('contactPerson')} <span aria-hidden="true">*</span>
          </label>
          <input
            id="contactPerson"
            name="contactPerson"
            required
            aria-required="true"
            aria-invalid={Boolean(fieldErrors.contactPerson)}
            className={inputClass}
            value={form.contactPerson}
            onChange={(e) => update('contactPerson', e.target.value)}
          />
          {fieldErrors.contactPerson ? (
            <p className="mt-1 font-ui text-ui-xs text-hbb-coral">{fieldErrors.contactPerson}</p>
          ) : null}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="email" className="font-ui text-ui-sm text-[var(--dim)]">
              {t('email')} <span aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.email)}
              className={inputClass}
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
            {fieldErrors.email ? (
              <p className="mt-1 font-ui text-ui-xs text-hbb-coral">{fieldErrors.email}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="phone" className="font-ui text-ui-sm text-[var(--dim)]">
              {t('phone')} <span aria-hidden="true">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.phone)}
              className={inputClass}
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
            {fieldErrors.phone ? (
              <p className="mt-1 font-ui text-ui-xs text-hbb-coral">{fieldErrors.phone}</p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-ui text-lg font-bold text-hbb-black">{t('eventLegend')}</legend>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="font-ui text-ui-sm text-[var(--dim)]">
              {t('startDate')} <span aria-hidden="true">*</span>
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.startDate)}
              className={inputClass}
              value={form.startDate}
              onChange={(e) => update('startDate', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="font-ui text-ui-sm text-[var(--dim)]">
              {t('endDate')} <span aria-hidden="true">*</span>
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.endDate)}
              className={inputClass}
              value={form.endDate}
              onChange={(e) => update('endDate', e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="guestCount" className="font-ui text-ui-sm text-[var(--dim)]">
              {t('guestCount')}
            </label>
            <input
              id="guestCount"
              name="guestCount"
              type="number"
              min={1}
              className={inputClass}
              value={form.guestCount}
              onChange={(e) => update('guestCount', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="eventType" className="font-ui text-ui-sm text-[var(--dim)]">
              {t('eventType')} <span aria-hidden="true">*</span>
            </label>
            <select
              id="eventType"
              name="eventType"
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.eventType)}
              className={inputClass}
              value={form.eventType}
              onChange={(e) => update('eventType', e.target.value)}
            >
              <option value="">{t('eventTypePlaceholder')}</option>
              {eventTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {fieldErrors.eventType ? (
              <p className="mt-1 font-ui text-ui-xs text-hbb-coral">{fieldErrors.eventType}</p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label htmlFor="roomCount" className="font-ui text-ui-sm text-[var(--dim)]">
              {t('roomCount')}
            </label>
            <input
              id="roomCount"
              name="roomCount"
              type="number"
              min={0}
              className={inputClass}
              value={form.roomCount}
              onChange={(e) => update('roomCount', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="overnightGuestCount" className="font-ui text-ui-sm text-[var(--dim)]">
              {t('overnightGuestCount')}
            </label>
            <input
              id="overnightGuestCount"
              name="overnightGuestCount"
              type="number"
              min={0}
              className={inputClass}
              value={form.overnightGuestCount}
              onChange={(e) => update('overnightGuestCount', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="stayDuration" className="font-ui text-ui-sm text-[var(--dim)]">
              {t('stayDuration')}
            </label>
            <input
              id="stayDuration"
              name="stayDuration"
              className={inputClass}
              value={form.stayDuration}
              onChange={(e) => update('stayDuration', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label htmlFor="roomSlug" className="font-ui text-ui-sm text-[var(--dim)]">
            {t('roomOfInterest')}
          </label>
          <select
            id="roomSlug"
            name="roomSlug"
            className={inputClass}
            value={form.roomSlug}
            onChange={(e) => update('roomSlug', e.target.value)}
          >
            <option value="">{t('roomNone')}</option>
            {roomOptions.map((room) => (
              <option key={room.slug} value={room.slug}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-start gap-2 font-ui text-ui-sm text-[var(--body-text)]">
          <input
            type="checkbox"
            checked={form.isRoomBlock}
            onChange={(e) => update('isRoomBlock', e.target.checked)}
            className="mt-1"
          />
          {t('roomBlock')}
        </label>
        <div>
          <label htmlFor="notes" className="font-ui text-ui-sm text-[var(--dim)]">
            {t('notes')}
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            className={inputClass}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="sr-only">{t('consentLegend')}</legend>
        <label className="flex items-start gap-2 font-ui text-ui-sm text-[var(--body-text)]">
          <input
            type="checkbox"
            required
            aria-required="true"
            checked={form.privacyAccepted}
            onChange={(e) => update('privacyAccepted', e.target.checked)}
            className="mt-1"
          />
          <span>
            {t.rich('privacyConsent', {
              privacy: (chunks) => (
                <Link href="/privacy" className="text-hbb-teal underline-offset-2 hover:underline">
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </label>
        {fieldErrors.privacyAccepted ? (
          <p className="font-ui text-ui-xs text-hbb-coral">{fieldErrors.privacyAccepted}</p>
        ) : null}

        <label className="flex items-start gap-2 font-ui text-ui-sm text-[var(--body-text)]">
          <input
            type="checkbox"
            required
            aria-required="true"
            checked={form.consentGiven}
            onChange={(e) => update('consentGiven', e.target.checked)}
            className="mt-1"
          />
          <span>{t('dataConsent')}</span>
        </label>
        {fieldErrors.consentGiven ? (
          <p className="font-ui text-ui-xs text-hbb-coral">{fieldErrors.consentGiven}</p>
        ) : null}

        <p className="font-ui text-ui-xs text-[var(--dim)]">{t('requiredHint')}</p>

        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center bg-hbb-teal px-[22px] py-2.5 font-ui text-[0.8rem] font-bold tracking-[0.04em] text-white transition-colors hover:bg-[#245a67] disabled:opacity-50"
        >
          {status === 'submitting' ? t('submitting') : t('submit')}
        </button>
      </fieldset>
    </form>
  )
}
