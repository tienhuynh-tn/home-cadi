# Deploy And Git

Verification:
- Run `npm run build` after source, asset, Vite, Netlify, or workflow changes.
- `npm run dev -- --host 127.0.0.1` starts the local Vite server for preview.
- If the sandbox blocks the dev server with `EPERM`, retry with approval.

Deployment:
- Netlify uses `netlify.toml`: command `npm run build`, publish directory `dist`, Node `22`.
- GitHub Pages uses `.github/workflows/deploy-pages.yml`.
- The GitHub Pages workflow sets `DEPLOY_TARGET=github-pages`, which makes Vite use base `/home-cadi/`.

Git:
- Do not commit or push unless explicitly requested.
- Before committing, inspect `git status --short --branch`, `git diff --stat`, and relevant diffs.
- Stage exact intended files.
- Run `npm run build` before commit when code, assets, config, or workflow changed.
- If the user asks to commit and push to main, commit focused changes on `main`, push `origin main`, then confirm `git status --short --branch` is clean and aligned.
