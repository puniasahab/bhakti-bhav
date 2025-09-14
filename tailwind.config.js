/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'kruti': ['KrutiDev', 'sans-serif'],
        'eng': ['Arial', 'Helvetica', 'sans-serif'],
      },
      colors: {
        'theme': {
          primary: '#610419',
          light: '#FFFAF4',
        }
      }
    },
  },
  plugins: [],
}
