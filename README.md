# CADI'S WEDDING

Mobile-first wedding invitation for Duy and Thao, built with Vite.

## What The Site Includes

- Phone-first invitation layout with a desktop warning at wider widths.
- Responsive cover image variants in `public/assets`.
- Story sections with decorative signature icons for camera, teacher/book, pencil, film, and Coca-Cola can.
- Wedding song audio with a bottom-right music toggle.
- RSVP form backed by Supabase, with an optional wish saved on the RSVP row.
- Public wishes page backed by RSVP wishes, shown one at a time as centered text.
- Client-side RSVP validation for required fields, length limits, spam honeypot, and common sensitive words.

## Project Structure

- `index.html`: visible page markup, SVG symbols, audio tag, and form markup.
- `src/styles.css`: all layout and visual styling.
- `src/main.js`: scroll reveal, story timer, music control, RSVP submission, public wish loading, and form validation.
- `supabase-rsvps.sql`: Supabase table, row-level security policies, admin access, and public RSVP wishes function.
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

The RSVP and public wishes features need Supabase credentials at build/runtime:

```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

If these are missing, the site still renders but the RSVP form cannot submit and public wishes cannot load.

## RSVP And Wishes Setup

Run `supabase-rsvps.sql` in Supabase to create/update the `rsvps` table, RSVP admin access, and the public read function for RSVP wishes.

Current client limits:

- Name: `60` characters.
- RSVP note: `240` characters.
- Optional wish: `240` characters.
- Required RSVP values are rejected when empty; the wish can be left blank.
- Common sensitive words and phrases in English and Vietnamese are rejected.

The SQL policy has broader length checks than the client so the browser remains the stricter user-facing validation layer.

## Image Workflow

To update the cover image:

1. Replace `source-images/cover.jpeg`.
2. Run:

```sh
npm run images:cover
```

This regenerates:

- `public/assets/cover.jpeg`
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
