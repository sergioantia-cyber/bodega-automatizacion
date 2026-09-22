/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bogad: {
          yellow: 'var(--color-bogad-yellow, #FFE600)',
          lime: 'var(--color-bogad-lime, #D2FF00)',
          coral: 'var(--color-bogad-coral, #FF5C38)',
          cyan: 'var(--color-bogad-cyan, #00F0FF)',
          purple: 'var(--color-bogad-purple, #A388EE)',
          dark: '#0F172A',
          cardDark: '#1E293B',
          light: '#F8FAFC',
          cardLight: '#FFFFFF',
          border: '#0F172A',
        }
      },
      boxShadow: {
        'tactile': '4px 4px 0px #0F172A',
        'tactile-sm': '2px 2px 0px #0F172A',
        'tactile-lg': '6px 6px 0px #0F172A',
        'tactile-pressed': '1px 1px 0px #0F172A',
        'tactile-dark': '4px 4px 0px #F8FAFC',
        'tactile-dark-sm': '2px 2px 0px #F8FAFC',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
