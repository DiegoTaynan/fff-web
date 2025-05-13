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
      "/api": {
        target: "https://familyfriendsadmin.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
