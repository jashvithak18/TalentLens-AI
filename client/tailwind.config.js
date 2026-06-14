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
        // Redefined to transition existing markup to premium light mode first
        darkBg: '#FAFAFA',     // Soft background
        darkCard: '#FFFFFF',   // Pure white cards
        darkBorder: '#E5E7EB', // Slate border
        brandPrimary: '#4F46E5', // Indigo 600
        brandSecondary: '#3B82F6', // Blue 500
        brandAccent: '#10B981', // Emerald 500
        brandDark: '#4338CA',   // Indigo 700
        textMuted: '#64748B'    // Slate 500
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01), 0 10px 15px -3px rgba(0, 0, 0, 0.03)',
        glow: '0 0 15px rgba(79, 70, 229, 0.1)',
      }
    },
  },
  plugins: [],
}
