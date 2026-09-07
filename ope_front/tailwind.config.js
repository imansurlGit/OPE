/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── 3 couleurs de marque OPE ──────────────────────────────────
        'ope-primary': '#2f6084',        // Bleu OPE
        'ope-orange':  '#f15b29',        // Orange OPE
        'ope-white':   '#ffffff',        // Blanc

        // ── Dérivés (reliés aux CSS variables pour garder la cohérence) ──
        'ope-primary-dark':  'var(--color-primary-dark)',
        'ope-primary-light': 'var(--color-primary-light)',
        'ope-orange-dark':   'var(--color-orange-dark)',
        'ope-bg':            'var(--color-bg)',
        'ope-bg-card':       'var(--color-bg-card)',
        'ope-text':          'var(--color-text)',
        'ope-text-muted':    'var(--color-text-muted)',
        'ope-footer':        'var(--color-footer-bg)',
        'ope-border':        'var(--color-border)',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
        'count-tick': {
          '0%':   { transform: 'translateY(-6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.7s ease-out both',
        'fade-up-d1': 'fade-up 0.7s 0.15s ease-out both',
        'fade-up-d2': 'fade-up 0.7s 0.30s ease-out both',
        'fade-up-d3': 'fade-up 0.7s 0.45s ease-out both',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'count-tick': 'count-tick 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
