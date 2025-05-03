import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: "terser",
    cssCodeSplit: true,
  },
  server: {
    // Sem proxy para evitar o erro 500 quando não há backend local
    port: 3000, // Voltando para a porta padrão
    host: true, // Permite acesso externo
    open: true, // Abre o navegador automaticamente
  },
});
