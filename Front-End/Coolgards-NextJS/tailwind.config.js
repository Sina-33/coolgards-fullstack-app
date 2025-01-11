/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    'node_modules/preline/dist/*.js',

  ],
  theme: {
    extend: {
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '90': '22rem',
        '100': '28rem',
        '128': '32rem',
        '144': '36rem',
      },
      colors: {
        logo: '#00a2ea'
      }
    },
  },
  plugins: [
    require('preline/plugin'),

  ],
}
