import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0b0f12',
        iron: '#11171a',
        stonekeep: '#182025',
        parchment: '#ece7dc',
        vellum: '#9ca5a9',
        bronze: '#b4853d',
        gold: '#d5ad57',
        ember: '#e26870',
        banner: '#983844',
        royal: '#2f667d',
        moss: '#62aa70',
      },
      boxShadow: {
        glow: '0 0 42px rgba(230, 189, 98, 0.18)',
        keep: 'inset 0 1px 0 rgba(242, 223, 175, 0.16), 0 18px 46px rgba(0, 0, 0, 0.38)',
      },
      fontFamily: {
        display: ['Segoe UI Variable Display', 'Segoe UI Variable', 'Segoe UI', 'sans-serif'],
        sans: ['Segoe UI Variable', 'Segoe UI', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
