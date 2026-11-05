import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// Kawing is the main page. `matcha-mood/` is a second page — a self-contained merchant-profile
// ordering site (see matcha-mood/README.md) — served at /matcha-mood/ in dev and build.
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
        matchaMood: fileURLToPath(new URL("./matcha-mood/index.html", import.meta.url)),
      },
    },
  },
});
