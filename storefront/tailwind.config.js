/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neon (Legacy)
        neonCyan: "#00E5FF",
        neonMagenta: "#FF00FF",
        neonLime: "#CCFF00",
        deepBlack: "#0A0A0A",
        // Editorial Gallery (Modern)
        primary: "#000000",
        surface: "#FFFFFF",
        "bg-color": "#F9F9F9",
        "text-muted": "#474747",
        "surface-container": "#EEEEEE",
        "primary-dark": "#0047ff",
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'whisper': '0 24px 48px -12px rgba(26, 28, 28, 0.06)',
      }
    },
  },
  plugins: [],
}
