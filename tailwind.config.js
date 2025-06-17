// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Important: include all relevant file types
  ],
  theme: {
    extend: {
      colors: {
        'brand-green-bright': '#34D399', // A vibrant green for buttons/logo
        'brand-red': '#EF4444',          // Red for "LIVE"
        'brand-yellow': '#F59E0B',       // Yellow for "INSTANT"
        'brand-text-light': '#F3F4F6',   // Light text for dark backgrounds
        'brand-text-dark': '#1F2937',    // Dark text for light backgrounds
        // Gradient colors from your design (approximations)
        'brand-primary-bg-dark': '#2c134f', // Darker purple/blue
        'brand-primary-bg-light': '#4f2c85', // Lighter purple/blue
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
      },
      backgroundImage: theme => ({
        'gradient-primary': `linear-gradient(to bottom right, ${theme('colors.brand-primary-bg-light')}, ${theme('colors.brand-primary-bg-dark')})`,
      }),
    },
  },
  plugins: [],
}