import type { Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          lavender: {
            light: "#f3e8ff",
            medium: "#e3c8ff",
            dark: "#d0aaff",
          },
          accent: "#7e3af2",
          text: {
            primary: "#1a1a1a",
            secondary: "#4a4a4a",
            light: "#717171"
          }
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter var',
          ...(fontFamily.sans as string[])
        ],
      },
    },
  },
  plugins: [],
}

export default config
