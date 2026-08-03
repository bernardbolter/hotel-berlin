import type { Field } from 'payload'

/** Text field with searchable Lucide icon picker (stores PascalCase name). */
export const lucideIconField = (name = 'icon', label = 'Icon'): Field => ({
  name,
  type: 'text',
  label,
  admin: {
    components: {
      Field: '/components/admin/LucideIconPicker#LucideIconPicker',
    },
    description: 'Pick a Lucide icon. Leave blank for no icon.',
  },
})
