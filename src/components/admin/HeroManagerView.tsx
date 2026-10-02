import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'

import { isHotelStaffUser } from '@/access'
import type { HeroSlideContext } from '@/lib/hero/slideContext'
import { HeroManagerClient } from './HeroManagerClient'

type Props = AdminViewServerProps & {
  context: HeroSlideContext
}

export function HeroManagerView({
  initPageResult,
  params,
  searchParams,
  viewActions,
  context,
}: Props) {
  const {
    locale,
    permissions,
    req: { i18n, payload, user },
    visibleEntities,
  } = initPageResult

  if (isHotelStaffUser(user)) {
    return (
      <DefaultTemplate
        i18n={i18n}
        locale={locale}
        params={params}
        payload={payload}
        permissions={permissions}
        searchParams={searchParams}
        user={user ?? undefined}
        viewActions={viewActions}
        visibleEntities={visibleEntities}
      >
        <p style={{ padding: 24 }}>
          Keine Berechtigung.{' '}
          <a href="/admin/rooms-manager">Zum Zimmer-Manager</a>
        </p>
      </DefaultTemplate>
    )
  }

  return (
    <DefaultTemplate
      i18n={i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={user ?? undefined}
      viewActions={viewActions}
      visibleEntities={visibleEntities}
    >
      <HeroManagerClient context={context} />
    </DefaultTemplate>
  )
}

export function HeroStartseiteView(props: AdminViewServerProps) {
  return <HeroManagerView {...props} context="homepage" />
}

export function HeroHierView(props: AdminViewServerProps) {
  return <HeroManagerView {...props} context="here" />
}

export function HeroEssenView(props: AdminViewServerProps) {
  return <HeroManagerView {...props} context="eat-and-drink" />
}

export default HeroStartseiteView
