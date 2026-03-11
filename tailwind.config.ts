import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#00A2B2',
          hover: '#008F9E',
          light: '#5FD1DB',
          surface: '#E6F8FA',
        },
        text: {
          primary: '#1C1B1F',
          subtle: '#6D6D6D',
        },
        border: {
          DEFAULT: '#CED4DC',
          light: '#C9C9C9',
          card: '#EDEDED',
          header: '#E6E8ED',
        },
        surface: {
          page: '#F4F7FA',
          header: '#E6E8ED',
          white: '#FFFFFF',
        },
        status: {
          active: '#16A34A',
          activeSurface: '#DCFCE7',
          draft: '#5FD1DB',
          draftSurface: '#ECFEFF',
          new: '#DC2626',
          newSurface: '#FEE2E2',
          archived: '#C9C9C9',
          archivedSurface: '#F3F4F6',
          warning: '#F59E0B',
          warningSurface: '#FEF3C7',
          danger: '#DC2626',
          dangerSurface: '#FEE2E2',
          success: '#16A34A',
          successSurface: '#DCFCE7',
          info: '#0EA5E9',
          infoSurface: '#E0F2FE',
        },
      },
      boxShadow: {
        'nav-active': '0px 1px 8px 0px rgba(0,0,0,0.15)',
        'dropdown': '0px 4px 16px rgba(0,0,0,0.15)',
        'row-hover': '0px 1px 4px rgba(0,0,0,0.10)',
        'back-btn': '0px 1px 8px 0px rgba(0,0,0,0.15)',
        'phone': '0 32px 80px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config
