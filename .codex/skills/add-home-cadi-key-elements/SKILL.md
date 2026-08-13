---
name: add-home-cadi-key-elements
description: Add restrained Home Cadi signature/key-element icons to a page or section in /Users/tienhuynh-tn/Projects/home-cadi. Use when the user asks to add key elements, icons like other pages, signature elements, page decorations, camera/book/pencil/film/cola symbols, or visual page identity elements to the Home Cadi invitation without changing wedding copy.
---

# Add Home Cadi Key Elements

## Workflow

1. Work in `/Users/tienhuynh-tn/Projects/home-cadi`.
2. Inspect `index.html` for the existing hidden SVG symbols: `signature-camera`, `signature-film`, `signature-book`, `signature-pencil`, and `signature-cola`.
3. Inspect `src/styles.css` for existing `.signature-elements`, `.signature-icon`, and section-specific placement patterns.
4. Add icons as SVG `<use>` elements inside a section-local container:

```html
<div class="signature-elements signature-elements-example" aria-hidden="true">
  <svg class="signature-icon signature-book example-key-icon example-key-icon-book"><use href="#signature-book"></use></svg>
</div>
```

5. Keep icons decorative: `aria-hidden="true"`, no visible label text, no factual wedding content changes.
6. Position icons in outer margins and empty space. Avoid placing them over faces, primary text, form fields, buttons, or film/photo content.
7. Use the existing quiet palette:
   - book/pencil: green-tinted
   - camera/film: ink-tinted
   - cola/hearts: red-tinted
8. Keep icons small, usually `28px` to `34px`, and use opacity around `0.45` to `0.65`.
9. For scroll-revealed sections, let icons appear with the section by using the existing `.scroll-reveal` behavior on the section, not separate JavaScript.

## Verification

- Run `npm run build` after edits.
- Run `git diff --check`.
- For visual changes, inspect at mobile widths `390px` and `320px`.
- Check icon rectangles against key content rectangles; there should be no overlap with readable text, faces/photos, form controls, or the music button.
- Confirm desktop/landscape still shows the existing `.desktop-warning`.

## Avoid

- Do not add new icon systems, fonts, libraries, or SVG symbols unless the existing symbols cannot express the page.
- Do not replace requested copy with key-element text. In this project, "key elements" usually means decorative signature icons like the other pages.
- Do not make the decoration loud or dense; start with three or four icons and validate collisions before adding more.
