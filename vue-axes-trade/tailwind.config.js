/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Bleu principal
        secondary: '#f97316', // Orange
        'primary-dark': '#1d4ed8', // Bleu foncé
        'secondary-dark': '#ea580c', // Orange foncé
        'axes': '#dc2626', // Rouge pour "Axes"
        'trade': '#2563eb', // Bleu pour "Trade"
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}