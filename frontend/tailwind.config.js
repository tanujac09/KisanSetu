/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        field: { DEFAULT: '#2F7D46', dark: '#1F5732' },
        harvest: { DEFAULT: '#F5A623', dark: '#B87D12' },
        mandi: { DEFAULT: '#2563EB', dark: '#1D4ED8' },
        soil: { DEFAULT: '#8B5E34', dark: '#5E3F23' },
        alert: { DEFAULT: '#DC2626', dark: '#991B1B' }
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        pill: '999px'
      }
    }
  },
  plugins: []
};
