# Structure

Important files:
- `index.html`: owns metadata, visible markup, hero image element, couple/date/copy text, and desktop warning markup.
- `src/styles.css`: owns all layout, typography, colors, image overlay, phone-only design, and desktop warning styling.
- `src/main.js`: only imports `./styles.css`.
- `source-images/cover.jpg`: editable source image to replace when updating the wedding photo.
- `public/assets/cover.jpg`: generated public hero/Open Graph image.
- `public/assets/cover-480.jpg`, `cover-720.jpg`, `cover-1080.jpg`: responsive in-page hero variants.
- `scripts/generate-cover-variants.sh`: regenerates public cover images from `source-images/cover.jpg`.
- `vite.config.js`: sets `base` to `/home-cadi/` only when `DEPLOY_TARGET=github-pages`.
- `netlify.toml`: Netlify build and SPA-style redirect config.
- `.github/workflows/deploy-pages.yml`: GitHub Pages build/deploy workflow.

Current architecture:
- No React components are used despite Vite.
- Do not add a framework or component abstraction for small content/style edits.
- Keep markup and CSS simple unless the user requests a broader rebuild.
