import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#080c14',
          2: '#0d1520',
          3: '#111d2e',
        },
        surface: {
          DEFAULT: '#0f1e30',
          2: '#162540',
        },
        accent: {
          DEFAULT: '#2e7dff',
          2: '#00e5ff',
          3: '#ff6b35',
          4: '#a259ff',
        },
        brand: {
          jib:    '#ff9800',
          pop:    '#ff4d4d',
          den:    '#ffb800',
          del:    '#00c853',
          corner: '#64b5f6',
        },
        fiq: {
          green:  '#00e096',
          red:    '#ff4560',
          gold:   '#ffb800',
          border: 'rgba(56,140,255,0.12)',
          border2:'rgba(56,140,255,0.22)',
        }
      },
      fontFamily: {
        syne:  ['Syne', 'sans-serif'],
        mono:  ['DM Mono', 'monospace'],
        sans:  ['Instrument Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker': 'ticker 40s linear infinite',
        'fade-in-up': 'fadeInUp 0.4s ease both',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
export default config
