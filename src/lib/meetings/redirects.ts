/**
 * Legacy live-site → new meetings URL redirects.
 * Fill once the slug mapping from hotel-berlin.de/tagungen-arbeiten is confirmed.
 */
export function buildMeetingRedirects(): {
  source: string
  destination: string
  permanent: boolean
}[] {
  return [
    {
      source: '/tagungen-arbeiten',
      destination: '/de/tagungen',
      permanent: true,
    },
    {
      source: '/en/tagungen-arbeiten',
      destination: '/en/meetings',
      permanent: true,
    },
    {
      source: '/tagungen-arbeiten/anfrage',
      destination: '/de/tagungen/anfrage',
      permanent: true,
    },
    {
      source: '/en/meet-work/request-for-proposal',
      destination: '/en/meetings/request',
      permanent: true,
    },
  ]
}
