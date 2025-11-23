/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1e3a8a', // blue-900
          light: '#3b82f6', // blue-500
          dark: '#172554', // blue-950
        },
        secondary: {
          DEFAULT: '#f59e0b', // amber-500
          light: '#fbbf24', // amber-400
          dark: '#b45309', // amber-700
        },
        accent: {
          DEFAULT: '#14b8a6', // teal-500
          light: '#2dd4bf', // teal-400
          dark: '#0f766e', // teal-700
        },
        background: '#f8fafc', // slate-50
        surface: '#ffffff',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}
