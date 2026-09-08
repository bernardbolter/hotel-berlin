import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Inside Navigation',
  admin: {
    description:
      'Choose and reorder up to 5 inside (/here) pages for the primary nav on /here. Outside primary links stay fixed in code.',
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        const rows = (data?.secondaryLinks ?? []) as Array<{
          page?: number | { id?: number } | null
        }>
        const pageIds = rows.map((row) => {
          const page = row?.page
          if (page == null) return null
          return typeof page === 'object' ? page.id : page
        })

        if (pageIds.some((id: number | null | undefined) => id == null)) {
          throw new Error('Each /here link must have a page selected.')
        }

        if (new Set(pageIds).size !== pageIds.length) {
          throw new Error('Each page can only appear once in /here navigation.')
        }
      },
    ],
    afterChange: [
      async () => {
        try {
          const { revalidatePath } = await import('next/cache')
          revalidatePath('/', 'layout')
        } catch {
          // No-op outside Next.js request context (e.g. seed scripts)
        }
      },
    ],
  },
  fields: [
    {
      name: 'secondaryLinks',
      label: 'Inside navigation (/here)',
      type: 'array',
      maxRows: 5,
      admin: {
        description:
          'Drag to reorder. These become row 1 on /here. Maximum 5 links.',
        initCollapsed: false,
      },
      fields: [
        {
          name: 'page',
          label: 'Page',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
          filterOptions: {
            context: { in: ['inside', 'both'] },
          },
          admin: {
            description: 'Inside (/here) pages only.',
          },
        },
      ],
    },
  ],
}
