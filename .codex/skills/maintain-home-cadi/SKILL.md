---
name: maintain-home-cadi
description: Maintain the Home Cadi wedding website at /Users/tienhuynh-tn/Projects/home-cadi. Use when Codex is asked to update the wedding invitation content, layout, styling, image performance, assets, Vite build, Netlify config, GitHub Pages workflow, or commit/push workflow for this specific project.
---

# Maintain Home Cadi

## Start Here

Work in `/Users/tienhuynh-tn/Projects/home-cadi` unless the user explicitly points elsewhere.

Before changing files:
- Run `git status --short --branch`.
- Read the relevant reference files listed below.
- Inspect the current implementation in `index.html` and/or `src/styles.css`.
- Preserve unrelated worktree changes.

Do not commit or push unless the user explicitly requests it.

## Reference Routing

- For site purpose, current copy, and project facts, read `references/project-overview.md`.
- For file ownership and repository layout, read `references/structure.md`.
- For visual changes, typography, spacing, and mobile layout, read `references/design-guidelines.md`.
- For hero image optimization or asset replacement, read `references/image-workflow.md`.
- For build, deploy, GitHub Pages, Netlify, commit, or push work, read `references/deploy-and-git.md`.

## Core Workflow

1. Confirm the request scope from the current repo state, not memory alone.
2. Make the smallest change that satisfies the user request.
3. Keep the site phone-first; desktop currently shows a device warning.
4. Run `npm run build` after source, asset, config, or deployment changes.
5. For visual work, start or reuse `npm run dev -- --host 127.0.0.1` when a preview is useful.
6. Review the final diff before summarizing.

## Image Variant Helper

For replacing or regenerating hero image variants, use:

```sh
cd /Users/tienhuynh-tn/Projects/home-cadi
npm run images:cover
```

Read `references/image-workflow.md` before running it.
