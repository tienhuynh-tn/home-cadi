import { defineConfig } from "vite";
import { resolve } from "node:path";

const isGitHubPages = process.env.DEPLOY_TARGET === "github-pages";

export default defineConfig({
  base: isGitHubPages ? "/home-cadi/" : "/",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        adminRsvp: resolve(__dirname, "admin-rsvp.html"),
      },
    },
  },
});
