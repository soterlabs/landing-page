# Soter Labs website

The Soter Labs story site is a statically generated [Astro](https://astro.build/) project. It keeps the current lightweight HTML/CSS/JavaScript delivery model while giving the site a shared layout and one source of truth for repeated content.

## Work locally

```bash
npm install
npm run dev
```

Create the production site with:

```bash
npm run build
```

Astro writes the deployable output to `dist/`. Railway builds that directory and serves it with `serve`.

## Where things live

- `src/layouts/BaseLayout.astro` owns metadata, navigation, footer, analytics, theme setup, and shared scripts.
- `src/pages/` contains the six main story pages, the 404 page, and generated team routes.
- `src/data/site.ts` is the source of truth for services, values, proof metrics, and the five-step operating cycle.
- `src/data/team.ts` is the roster and generates every `/team/:slug` page.
- `src/pages/clients.astro` contains the original orbital client system and its master/detail ledger.
- `public/assets/css/styles.css` preserves the custom visual system; the small vanilla scripts in `public/assets/js/` run the orrery, team modal, service dial, theme, navigation, and reveals.

The root-level `.html` files and `assets/` directory are the pre-Astro static implementation. They remain temporarily as a rollback reference; production uses `src/` and `public/` exclusively.

## Updating the story

Change repeated facts in the corresponding `src/data/*.ts` file instead of editing several pages. Page-specific narrative belongs in its `src/pages/*.astro` file. After every change, run `npm run build` and visually check the affected page at desktop and mobile widths.

## Why Astro

The original site was plain HTML, CSS, and vanilla JavaScript. Astro was added only as a build-time composition layer so shared navigation, metadata, footers, and team data are edited once. It does not replace the custom visual components or ship a client-side framework runtime; those interactions remain vanilla JavaScript.

## Analytics and contact

Umami Cloud is loaded from the shared layout and restricted to `soterlabs.com`, so local visits do not count. Contact remains direct email by design; there is no form backend or stored visitor data.
