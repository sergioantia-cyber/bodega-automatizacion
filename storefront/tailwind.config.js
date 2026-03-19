/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonCyan: "#00E5FF",
        neonMagenta: "#FF00FF",
        neonLime: "#CCFF00",
        deepBlack: "#0A0A0A",
      },
    },
  },
  plugins: [],
}
