/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: '#1a1a2e',
        vermilion: '#c0392b',
        'vermilion-light': '#e74c3c',
        'vermilion-dark': '#962d22',
        sandalwood: '#5c3d2e',
        'sandalwood-light': '#7a5644',
        parchment: '#f5f0e8',
        'parchment-dark': '#ede7d9',
        'parchment-light': '#faf7f2',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'serif'],
        sans: ['"Noto Sans SC"', 'sans-serif'],
      },
      animation: {
        'pulse-border': 'pulse-border 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'pulse-border': {
          '0%, 100%': { borderColor: 'rgba(192, 57, 43, 0.4)' },
          '50%': { borderColor: 'rgba(192, 57, 43, 1)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
