import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a237e',   // Azul escuro
        secondary: '#00897b', // Verde-azulado
        accent: '#ffa726',    // Laranja
        background: '#f5f7fa'
      },
      borderRadius: {
        xl: '0.9rem',
      },
      boxShadow: {
        card: '0 10px 25px -10px rgba(26,35,126,0.25)',
      },
    },
  },
  plugins: [],
}
export default config