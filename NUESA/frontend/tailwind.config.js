/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        nuesa: {
          emerald: '#059669',
          'emerald-dark': '#047857',
          'emerald-light': '#ecfdf5',
          mint: '#10B981',
          gold: '#D97706',
          'gold-dark': '#b45309',
          'gold-light': '#fef3c7',
          dark: '#030712',
          slate: '#0F172A',
          warm: '#fffbeb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
        heading: ['EB Garamond', 'serif'],
      },
      boxShadow: {
        'card': '0 25px 50px -12px rgba(0,0,0,0.15)',
        'card-hover': '0 30px 45px -12px rgba(0,0,0,0.2)',
        'glass': '0 8px 32px rgba(0,0,0,0.08)',
        'emerald': '0 6px 20px rgba(5,150,105,0.3)',
        'gold': '0 6px 20px rgba(217,119,6,0.3)',
        'dark-lg': '0 10px 40px rgba(0,0,0,0.4)',
      },
      backdropBlur: {
        glass: '12px',
      },
      backgroundImage: {
        'emerald-glow': 'radial-gradient(circle, rgba(5,150,105,0.15) 0%, rgba(3,7,18,0) 70%)',
        'gold-glow': 'radial-gradient(circle, rgba(217,119,6,0.12) 0%, rgba(3,7,18,0) 70%)',
        'grid-pattern': 'linear-gradient(rgba(5,150,105,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(5,150,105,0.04) 1px, transparent 1px)',
        'dot-pattern': 'radial-gradient(circle, rgba(5,150,105,0.08) 1px, transparent 1px)',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'spin-slower': 'spin 20s linear infinite reverse',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
