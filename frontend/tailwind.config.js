/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-void': '#030305',
        'bg-surface': '#0d0d12',
        'bg-raised': '#13131a',
        'border-default': '#1e1e2e',
        'border-glow': 'rgba(245, 158, 11, 0.3)',
        amber: '#f59e0b',
        cyan: '#06b6d4',
        emerald: '#10b981',
        red: '#ef4444',
        'text-primary': '#f1f5f9',
        'text-secondary': '#64748b',
        'text-muted': '#334155',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        'ibm-plex-mono': ['"IBM Plex Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s linear infinite',
        'fade-in-up': 'fadeInUp 400ms ease-out',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(16px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}