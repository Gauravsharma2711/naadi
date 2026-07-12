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
        sans: ['"Inter"', 'sans-serif'],
      },
      colors: {
        sky: {
          dark: '#FBFBFA',      // Clean off-white background
          card: '#FFFFFF',      // Crisp white cards
          midnight: '#E3E1DE',  // Thin border/divider
          gold: '#00D66B',      // Vivid Primary Green (MongoDB brand primary)
          sunset: '#B8E8C8',    // Muted Sprout Green
          amethyst: '#00D66B',  // Vivid Primary Green (success/growth flare)
          crimson: '#D64545',   // Alert/Error Red
          cream: '#001E2B',     // Deep text
          grey: '#5A6B70',      // Muted text
          info: '#2563EB'       // Informational blue for journey log and neutral status
        }
      }
    },
  },
  plugins: [],
}