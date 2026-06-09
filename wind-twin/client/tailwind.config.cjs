/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f2fbff',
          100: '#e6f7ff',
          200: '#bfeeff',
          300: '#99e6ff',
          400: '#4fd5ff',
          500: '#19c7ff',
          600: '#0fb0e6',
          700: '#0a7f99',
          800: '#065c66',
          900: '#03363a'
        },
        midnight: '#020f18'
      },
      borderRadius: {
        '3xl': '24px'
      }
    }
  },
  plugins: []
}
