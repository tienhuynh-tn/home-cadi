# Design Guidelines

Design intent:
- Mobile-first wedding invitation.
- Quiet, restrained, and legible.
- Photo remains the full-screen background inside `.invitation-card`.
- Decorative treatments should support readability without feeling loud.

Current layout:
- `.phone-stage` is the mobile surface.
- `.invitation-card` is a full-height framed invitation.
- `.hero-photo` is absolutely positioned behind content.
- `.hero-copy` contains the eyebrow, headline, and quote.
- `.couple-grid` sits at the bottom with the date above role/name blocks.
- Desktop widths at `721px` and above show `.desktop-warning` instead of the invitation.

Styling preferences:
- Keep title text split into two non-wrapping `h1 span` lines.
- Keep the quote on one line unless the user asks otherwise.
- Keep the quote as plain text; do not add a background unless requested.
- Keep date styling normal-weight and visually aligned with the lower role labels.
- Keep lower divider lines short and subtle.
- Prefer small localized CSS changes over redesigning the page.

Avoid:
- Loud hero effects, large cards, decorative orbs, heavy overlays, or marketing-page sections.
- Changing factual wedding copy unless the user explicitly requests it.
- Making the desktop warning into a full desktop invitation unless requested.
