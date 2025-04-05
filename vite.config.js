import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Desativa sourcemaps para uma build mais limpa
    minify: "terser", // Usa Terser para otimizar ainda mais a build
    cssCodeSplit: true, // Mantém os CSS separados para melhor performance
  },
  server: {
    proxy: {
      "/appointments": {
        target: "http://localhost:3001", // Certifique-se de que o backend está rodando nesta URL
        changeOrigin: true,
      },
    },
  },
});
