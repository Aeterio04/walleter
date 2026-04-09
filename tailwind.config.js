/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#CCFF00',
        background: '#09090B',
        surface: '#18181B',
        text: '#F4F4F5',
        muted: '#71717A',
        danger: '#FA114F',
      },
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        sans: ['"Space Grotesk"', 'sans-serif'],
        bold: ['"League Spartan"', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
      },
      spacing: {
        'sm': '16px',
        'md': '32px',
        'lg': '64px',
        'xl': '120px',
      },
    },
  },
  plugins: [],
}
