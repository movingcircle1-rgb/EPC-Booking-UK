/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#e71c5e',
          'primary-hover': '#c91852',
          'primary-dark': '#a01545',
          secondary: '#949494',
          'bg-1': '#949494',
          'bg-2': '#e1e1e1',
          text: '#293132',
          accent: '#e71c5e',
        },
      },
    },
  },
  plugins: [],
};
