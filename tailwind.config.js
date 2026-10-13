/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0a0d12',
          900: '#0f131a',
          850: '#151a24',
          800: '#1c2230',
          750: '#232b3c',
          700: '#2d374d',
          600: '#3e4b66',
        },
        felt: {
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        brand: ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
}
