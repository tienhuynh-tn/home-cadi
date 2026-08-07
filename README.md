# CADI'S WEDDING

Mobile-first wedding invitation for Duy and Thao, built with Vite.

## What The Site Includes

- Phone-first invitation layout with a desktop warning at wider widths.
- Responsive cover image variants in `public/assets`.
- Story sections with decorative signature icons for camera, teacher/book, pencil, film, and Coca-Cola can.
- Wedding song audio with a bottom-right music toggle.
- Wishes section backed by Supabase, shown one at a time as rotating quote cards.
- Client-side wish validation for required fields, length limits, spam honeypot, and common sensitive words.

## Project Structure

- `index.html`: visible page markup, SVG symbols, audio tag, and form markup.
- `src/styles.css`: all layout and visual styling.
- `src/main.js`: scroll reveal, story timer, music control, wishes loading/submission, and form validation.
- `supabase-wishes.sql`: Supabase table and row-level security policies for wishes.
- `public/assets`: browser-served images and song.
- `source-images`: source images used to regenerate public image variants.
- `scripts/generate-cover-variants.sh`: cover image variant generator.

## Local Development

Install dependencies:

```sh
npm install
```

Start the local dev server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Preview a production build:

```sh
npm run preview
```

## Environment Variables

The wishes feature needs Supabase credentials at build/runtime:

```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

If these are missing, the site still renders but the wishes form cannot load or submit wishes.

## Wishes Setup

Run `supabase-wishes.sql` in Supabase to create the `wishes` table and public read/insert policies.

Current client limits:

- Name: `24` characters.
- Message: `240` characters.
- Empty values are rejected.
- Common sensitive words and phrases in English and Vietnamese are rejected.

The SQL policy has broader length checks than the client so the browser remains the stricter user-facing validation layer.

## Image Workflow

To update the cover image:

1. Replace `source-images/cover.jpg`.
2. Run:

```sh
npm run images:cover
```

This regenerates:

- `public/assets/cover.jpg`
- `public/assets/cover-480.jpg`
- `public/assets/cover-720.jpg`
- `public/assets/cover-1080.jpg`

The script requires `sips` and `jpegtran`.

## Deployment

Netlify uses `netlify.toml`:

- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `22`

GitHub Pages uses `.github/workflows/deploy-pages.yml`:

- Runs on pushes to `main`.
- Uses Node `22`.
- Sets `DEPLOY_TARGET=github-pages`, which makes Vite use base `/home-cadi/`.
- Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from repository variables.
