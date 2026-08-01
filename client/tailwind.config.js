/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F2A26',
        teal: {
          50: '#EEF7F5',
          100: '#D6ECE7',
          200: '#AEDAD1',
          300: '#7FC2B5',
          400: '#4CA394',
          500: '#2E8577',
          600: '#1E6A5E',
          700: '#175349',
          800: '#123F38',
          900: '#0B2925',
        },
        clay: {
          50: '#FFF3EC',
          100: '#FFE2D0',
          200: '#FEC3A0',
          300: '#FB9E6C',
          400: '#F67C42',
          500: '#EE5F26',
          600: '#D6481A',
          700: '#AF3714',
          800: '#8A2C15',
          900: '#6F2513',
        },
        mist: '#F5F9F8',
      },
      fontFamily: {
        display: ['"Manrope"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px rgba(15, 42, 38, 0.06), 0 1px 2px rgba(15, 42, 38, 0.04)',
        cardHover: '0 12px 28px rgba(15, 42, 38, 0.12)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
