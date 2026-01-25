/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quake: {
          amber: '#f59e0b',
          orange: '#ea580c',
          dark: '#0a0a0f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'shake': 'shake 0.4s ease-in-out infinite',
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0) rotate(0)' },
          '25%': { transform: 'translateX(-4px) rotate(-1deg)' },
          '75%': { transform: 'translateX(4px) rotate(1deg)' },
        }
      }
    },
  },
  plugins: [],
}
