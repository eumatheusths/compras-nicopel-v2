import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // O segredo está nestas 3 linhas abaixo. Elas dizem pro CSS olhar dentro do SRC
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Nossas cores personalizadas da Nicopel
        nicopel: {
          blue: '#2563eb',       // Azul Royal
          'blue-dark': '#1e40af', // Azul Escuro
          slate: '#0f172a',      // Fundo do Menu
          bg: '#f8fafc',         // Fundo do Site (Cinza Gelo)
        }
      },
    },
  },
  plugins: [],
};
export default config;