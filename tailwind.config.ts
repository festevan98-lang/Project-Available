import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brass: {
          50: '#fdf8ec',
          100: '#f8ecc8',
          200: '#f0d68f',
          300: '#e6bc56',
          400: '#d9a437',
          500: '#c08a2a',
          600: '#9c6e22',
          700: '#785420',
          800: '#5c411f',
          900: '#3d2c15',
        },
        ink: {
          50: '#f5f4f0',
          100: '#e8e6df',
          200: '#cfccc1',
          300: '#a8a496',
          400: '#7a7668',
          500: '#52503f',
          700: '#2a2820',
          900: '#1a1815',
          950: '#100f0d',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '65ch',
      },
    },
  },
  plugins: [],
};

export default config;
