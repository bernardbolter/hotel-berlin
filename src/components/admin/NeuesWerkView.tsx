import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'

import { NeuesWerkClient } from './NeuesWerkClient'

export function NeuesWerkView({
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
      <NeuesWerkClient />
    </DefaultTemplate>
  )
}

export default NeuesWerkView
