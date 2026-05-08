/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ultron: {
          bg: '#0d1117',
          sidebar: '#161b22',
          accent: '#58a6ff',
          text: '#c9d1d9',
          border: '#30363d'
        }
      }
    },
  },
  plugins: [],
}
