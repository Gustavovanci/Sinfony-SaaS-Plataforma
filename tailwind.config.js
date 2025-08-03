/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Monitora todos os arquivos relevantes na pasta src
  ],
  theme: {
    extend: {
      colors: {
        // Usaremos variáveis CSS para o tema dinâmico
        brand: {
          primary: 'var(--color-primary)',
          secondary: 'var(--color-secondary)',
        }
      }
    },
  },
  plugins: [],
}