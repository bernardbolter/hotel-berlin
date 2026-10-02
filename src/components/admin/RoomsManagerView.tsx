import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'

import { RoomsManagerClient } from './RoomsManagerClient'

export function RoomsManagerView({
  initPageResult,
  params,
  searchParams,
  viewActions,
}: AdminViewServerProps) {
  const {
    locale,
    permissions,
    req: { i18n, payload, user },
    visibleEntities,
  } = initPageResult

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
      <RoomsManagerClient />
    </DefaultTemplate>
  )
}

export default RoomsManagerView
