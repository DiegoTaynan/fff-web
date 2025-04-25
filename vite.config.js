import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  build: {
    sourcemap: false,
    minify: "terser",
    cssCodeSplit: true,
  },
  server: {
    proxy: {
      "/appointments": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
