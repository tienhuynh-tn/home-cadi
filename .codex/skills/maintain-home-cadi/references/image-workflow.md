# Image Workflow

Current image behavior:
- `index.html` uses `public/assets/cover.jpg` directly for the visible hero image.
- `source-images/cover.jpg` archives the original provided cover photo.
- `public/assets/cover.jpg` is the same original image used by the hero and Open Graph image.
- The hero image element should keep:
  - `src="%BASE_URL%assets/cover.jpg"`
  - intrinsic `width` and `height` matching the original image
  - `fetchpriority="high"`
  - `decoding="async"`

When replacing `cover.jpg`:
1. Copy the provided original image to `source-images/cover.jpg`.
2. Copy the same original image to `public/assets/cover.jpg`.
3. Check dimensions with `sips -g pixelWidth -g pixelHeight public/assets/cover.jpg`.
4. Update the hero image `width` and `height` in `index.html` if needed.
5. Run `npm run build`.
6. Preview mobile layout and confirm the crop remains acceptable.
