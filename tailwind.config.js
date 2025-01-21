const { fontFamily } = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          // Light purple palette
          lavender: {
            light: "#f3e8ff",
            medium: "#e3c8ff",
            dark: "#d0aaff",
          },
          accent: "#7e3af2",
          // Text colors
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
          ...fontFamily.sans
        ],
      },
    },
  },
  plugins: [],
} 