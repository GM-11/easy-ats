/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#010104',
        foreground: '#ebe9fc',
        primary: '#3a31d8',
        secondary: '#020024',
        accent: '#0600c2',
        gray: {
          50: '#f9f8ff',
          100: '#f4f2ff',
          200: '#e9e6ff',
          300: '#d4d0ff',
          400: '#b8b3ff',
          500: '#9087ff',
          600: '#766ced',
          700: '#5c52d8',
          800: '#443baa',
          900: '#35307f',
        },
        red: {
          50: '#fef2f3',
          100: '#fde6e7',
          200: '#fdd0d3',
          300: '#faa9af',
          400: '#f57682',
          500: '#eb4655',
          600: '#d92133',
          700: '#b5182a',
          800: '#951828',
          900: '#7a1a26',
          950: '#430a12',
        },
      },
      boxShadow: {
        'input': '0 1px 2px 0 rgba(0, 0, 0, 0.15)',
        'card': '0 4px 10px -1px rgba(0, 0, 0, 0.25), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'button': '0 2px 5px 0 rgba(58, 49, 216, 0.3), 0 1px 3px 0 rgba(6, 0, 194, 0.2)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 