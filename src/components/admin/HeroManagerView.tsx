import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'

import { HeroManagerClient } from './HeroManagerClient'

type Props = AdminViewServerProps & {
  context: 'homepage' | 'here'
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

export default HeroStartseiteView
