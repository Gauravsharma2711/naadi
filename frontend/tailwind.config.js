/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        outfit: ['"Space Grotesk"', 'sans-serif'], // Alias for backward compatibility
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        sky: {
          dark: '#F7F9F8',      // Clean off-white background
          card: '#FFFFFF',      // Crisp white cards
          midnight: '#E2E8E5',  // Thin sage-grey dividers and borders
          gold: '#00684A',      // Vivid Forest Green (MongoDB brand primary)
          sunset: '#D1FAE5',    // Pale Sprout Green (low readiness)
          amethyst: '#00ED64',  // Vivid Spring Green (success/growth flare)
          crimson: '#F26157',   // Alert/Error Red
          cream: '#0E1714',     // Primary charcoal text
          grey: '#62756E'       // Muted Sage text
        }
      }
    },
  },
  plugins: [],
}