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
        // Custom premium color palettes
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#adc2ff',
          400: '#859dff',
          500: '#5c73ff', // Primary Brand Color
          600: '#3d4eff',
          700: '#1f29ff',
          850: '#0f14b3',
          900: '#0a0d80',
        },
        darkBg: '#0b0f19',
        darkCard: '#151d30',
        darkBorder: '#222f4b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
