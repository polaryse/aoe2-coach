import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#0a0c10',
        iron: '#1a1713',
        stonekeep: '#2a2924',
        parchment: '#f2dfaf',
        vellum: '#d8bd83',
        bronze: '#c59246',
        gold: '#e6bd62',
        ember: '#d85c31',
        banner: '#7e2230',
        royal: '#173b4f',
        moss: '#4f7d4f',
      },
      boxShadow: {
        glow: '0 0 42px rgba(230, 189, 98, 0.18)',
        keep: 'inset 0 1px 0 rgba(242, 223, 175, 0.16), 0 18px 46px rgba(0, 0, 0, 0.38)',
      },
      fontFamily: {
        display: ['Constantia', 'Palatino Linotype', 'Georgia', 'serif'],
        sans: ['Segoe UI Variable', 'Segoe UI', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
