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
        darkBg: '#0b0f19',     // Slate-950/deep navy
        darkCard: '#131c2e',   // Slate-900ish card
        darkBorder: '#1e293b', // Slate-800 border
        brandPrimary: '#6366f1', // Indigo-500
        brandSecondary: '#06b6d4', // Cyan-500
        brandAccent: '#10b981', // Emerald-500
        brandDark: '#4f46e5', // Indigo-600
        textMuted: '#94a3b8'  // Slate-400
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
