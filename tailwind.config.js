/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ✅ ADICIONAMOS A NOVA PALETA DE CORES
      colors: {
        'brand-green': {
          DEFAULT: '#90f29c', // Verde principal para botões e destaques
          light: '#a3f5b0',
          dark: '#7ddb8a',
        },
        'dark-primary': '#0D1117', // Fundo principal escuro
        'dark-secondary': '#161B22', // Fundo para cartões e seções
        'brand-border': '#30363d',   // Cor para bordas sutis
      }
    },
  },
  plugins: [],
}