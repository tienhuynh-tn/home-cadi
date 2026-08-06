import { defineConfig } from "vite";

const isGitHubPages = process.env.DEPLOY_TARGET === "github-pages";

export default defineConfig({
  base: isGitHubPages ? "/home-cadi/" : "/",
});

