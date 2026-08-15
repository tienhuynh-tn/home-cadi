# Image Workflow

Current image behavior:
- `index.html` uses responsive JPEG variants for the visible hero image.
- `source-images/cover.jpg` is the editable source image.
- `public/assets/cover.jpg` is the generated Open Graph image.
- The hero image element should keep:
  - `src="%BASE_URL%assets/cover-720.jpg"`
  - `srcset` with 480w, 720w, and 1080w variants
  - `sizes="100vw"`
  - `width="1366"` and `height="2048"`
  - `fetchpriority="high"`
  - `decoding="async"`

Current optimized variants:
- `cover-480.jpg`: 480 px wide
- `cover-720.jpg`: 720 px wide
- `cover-1080.jpg`: 1080 px wide

When replacing `cover.jpg`:
1. Put the new original at `source-images/cover.jpg`.
2. Regenerate public assets with `npm run images:cover`.
3. Check sizes with `du -h public/assets/cover*.jpg`.
4. Check dimensions with `sips -g pixelWidth -g pixelHeight public/assets/cover-480.jpg public/assets/cover-720.jpg public/assets/cover-1080.jpg`.
5. Run `npm run build`.
6. Preview mobile layout and confirm the crop remains acceptable.

Do not edit the generated files in `public/assets/` directly unless the user asks for a one-off manual asset change.
