/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { 50: '#f6ead9', 100: '#edcfaa', 500: '#d1a063', 600: '#d1a063', 700: '#b98245' },
        shop: { page: '#0e171b', surface: '#16232a', footer: '#0a1114', text: '#e8edf4', heading: '#f1f4f8', accent: '#d1a063', danger: '#ff9a90', success: '#4cc38a' },
      }
    },
  },
  plugins: [],
}
