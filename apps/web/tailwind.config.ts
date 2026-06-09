import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1A2E4A',
          secondary: '#1E5A9C',
          light: '#D6E8F7',
          accent: '#F5A623'
        },
        status: {
          active: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          inactive: '#6B7280'
        }
      }
    }
  },
  plugins: []
}

export default config
