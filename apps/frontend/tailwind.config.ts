import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#2A1323',
          card: '#3A1D31',
          rose: '#D16D9E',
          gold: '#F4C46A',
          text: '#FFF3FA',
          soft: '#E3B7CF'
        }
      }
    }
  },
  plugins: []
} satisfies Config;
