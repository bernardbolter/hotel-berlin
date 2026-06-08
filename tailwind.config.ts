import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Brand palette
        'hbb-teal': '#2C6B7A',
        'hbb-amber': '#F79B2E',
        'hbb-green': '#4A7A68',
        'hbb-coral': '#F95D62',
        'hbb-purple': '#6A5870',
        'hbb-gold': '#A08C38',
        'hbb-dark': '#1E1530',
        'hbb-black': '#141414',
        'hbb-nav-link': '#5A5550',

        // Section backgrounds
        'hbb-page': '#FBFBFB',
        'hbb-warm': '#F5F0EB',
        'hbb-amber-wash': '#FDF6EA',

        // Deep teal — Meet & Work, hero overlay
        'hbb-teal-deep': '#1A3C40',

        // Footer
        'hbb-footer': '#1E1530',

        // Footer text hierarchy — all AA compliant on #1E1530
        'hbb-footer-primary': '#F0EDE8',
        'hbb-footer-link': '#BBBBBB',
        'hbb-footer-muted': '#8A8A8A',
        'hbb-footer-amber': '#F79B2E',
        'hbb-footer-teal': '#7AB8B0',
      },

      fontFamily: {
        ui: ['var(--font-archivo-narrow)', 'sans-serif'],
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
      },

      fontSize: {
        // UI scale — Archivo Narrow
        'ui-xs': ['11px', { lineHeight: '1.4', letterSpacing: '0.02em' }],
        'ui-sm': ['12px', { lineHeight: '1.5', letterSpacing: '0.02em' }],
        'ui-base': ['13px', { lineHeight: '1.5' }],
        'ui-md': ['14px', { lineHeight: '1.5' }],
        'ui-lg': ['16px', { lineHeight: '1.6' }],
        'ui-xl': ['20px', { lineHeight: '1.5' }],
        // Utility label scale — uppercase, tracked
        label: ['9.5px', { lineHeight: '1.3', letterSpacing: '0.12em' }],
        // Editorial scale — Lora
        'serif-sm': ['15px', { lineHeight: '1.75' }],
        'serif-md': ['18px', { lineHeight: '1.6' }],
        'serif-lg': ['22px', { lineHeight: '1.35' }],
        'serif-xl': ['28px', { lineHeight: '1.25' }],
        'serif-2xl': ['36px', { lineHeight: '1.2' }],
        'serif-3xl': ['48px', { lineHeight: '1.15' }],
      },

      borderRadius: {
        // Hard brand rule: border-radius: 0 everywhere EXCEPT pill badges
        none: '0px',
        sm: '2px',
        pill: '9999px',
      },

      borderWidth: {
        DEFAULT: '0.5px',
        '1': '1px',
        '2': '2px',
      },

      spacing: {
        'section-x': '2.5rem',
        'section-y': '3rem',
        'section-sm': '1.25rem',
      },

      letterSpacing: {
        'ui-label': '0.12em',
        'ui-wide': '0.08em',
        'ui-tight': '0.02em',
      },
    },
  },
  plugins: [],
}

export default config
