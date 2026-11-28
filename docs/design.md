# Website for "Die Fräserei": design & architecture

This document captures the architecture, technical details and design decisions of the website. The backlog lives in
[`plan.md`](plan.md).

## Goals

- A **business-card site** online as fast as possible, extended iteratively afterwards.
- German content; English development docs.
- Modern, clean look with a **wooden character** derived from the sticker (`docs/sticker.png`).
- Static hosting on **GitHub Pages** under the custom domain **die-fraeserei.de**.
- Low maintenance: dependencies are kept current automatically (Dependabot + CI).

## Architecture overview

```
 src/ (Astro + Tailwind)  ──npm run build──▶  dist/ (static HTML/CSS/WebP/fonts)
                                                │
 push to main ─▶ GitHub Actions (deploy.yml) ───┴─▶ GitHub Pages ─▶ https://die-fraeserei.de
 pull request ─▶ GitHub Actions (ci.yml): npm ci → check → build
 Dependabot   ─▶ weekly grouped PRs ─▶ ci.yml
```

- **Astro 7, `output: 'static'`**: the build output is plain files. No server, no runtime dependencies.
- **Tailwind CSS 4**, CSS-first config in `src/assets/styles/tailwind.css` (upstream) +
  `src/assets/styles/fraeserei.css` (ours).
- **Site configuration** in `src/config.yaml`, loaded by AstroWind's integration (`vendor/integration/`) as the
  virtual module `astrowind:config`.
- **Business data** in `src/data/business.ts`: a single typed source for address, email, phone and legal details.

## AstroWind base

| Item                | Value                                                                                                                               |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Upstream            | https://github.com/arthelokyo/astrowind                                                                                             |
| Pinned commit       | `14e1a691f80548dcc36370847b1a02c0d0b12821` (2026-09-12, `main`, after tag `v1.0.0-beta.65`; package version `1.0.0-beta.66`)        |
| Upstream status     | v1 in maintenance mode (dependency updates + bug fixes); v2 announced with an integration that allows updates of template instances |
| How it was imported | One-time copy of the files (no git history, no upstream remote)                                                                     |

**Why a copy and not a package?** AstroWind is a template, not a library: `package.json` is `private`, nothing is
published to npm, and `vendor/integration/README.md` states that the integration "will become" updatable with v2.
A git upstream remote with merges was rejected because merges get noisy once the template is customised.

### Removed from upstream

- Deployment configs for other hosts: `Dockerfile`, `docker-compose.yml`, `nginx/`, `netlify.toml`, `vercel.json`,
  `wrangler.jsonc`, `public/_headers`, `sandbox.config.json`, `.stackblitzrc`, `.pnpmrc`, upstream CI workflow,
  Decap CMS (`public/decapcms/`) and the corresponding `.agents/skills`.
- All demo pages (`homes/`, `landing/`, `about`, `contact`, `pricing`, `services`, `privacy`, `terms`, `rss.xml`),
  demo blog posts and demo images; the `Announcement` widget.
- Dependencies: `@astrojs/mdx`, `@types/mdx`, `@astrojs/partytown`, `@astrojs/rss`, `@astro-community/astro-embed-*`.

### Customisation map

Keep changes to upstream files minimal and list every one here, so upstream fixes can be compared and applied.

| File                                     | Change                                                                                          |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `astro.config.ts`                        | Removed MDX/Partytown; added Barlow Condensed font; no remote image domains; single Shiki theme |
| `src/config.yaml`                        | Site name/URL, German SEO metadata, `language: de`, blog disabled, `theme: light:only`          |
| `src/components/CustomStyles.astro`      | Fräserei colour tokens + fonts; removed the `.dark` block                                       |
| `src/components/Logo.astro`              | SVG mark + wordmark                                                                             |
| `src/components/Favicons.astro`          | `mask-icon` colour                                                                              |
| `src/layouts/Layout.astro`               | Removed `ApplyColorMode`, added `<Font>` for Barlow Condensed, removed Unsplash preconnect      |
| `src/layouts/PageLayout.astro`           | No announcement bar, no RSS/theme toggle in header, uses our footer                             |
| `src/assets/styles/tailwind.css`         | Imports `fraeserei.css`                                                                         |
| `src/content.config.ts`                  | Added the `projekte` collection                                                                 |
| `src/components/widgets/Header.astro`    | `isActive` (server + client script) also matches sub-pages, e.g. `/projekte/<slug>`             |
| `vendor/integration/utils/loadConfig.ts` | Named import `{ load }` from `js-yaml` (v5 has no default export)                               |
| `src/navigation.ts`                      | Our header/footer links                                                                         |
| `src/pages/index.astro`, `404.astro`     | Rewritten (German)                                                                              |
| `package.json`                           | Name/version/description, `brand:assets` script, pruned dependencies                            |
| `.gitignore`                             | npm-only note, `.idea/`                                                                         |

Own files (no upstream counterpart): `src/components/fraeserei/*`, `src/assets/styles/fraeserei.css`,
`src/data/business.ts`, `src/pages/impressum.astro`, `src/pages/datenschutz.astro`, `design/`, `scripts/`,
`public/CNAME`, `.github/*`, docs.

### Updating from upstream AstroWind

1. Look at the upstream commits since the pinned commit:
   `https://github.com/arthelokyo/astrowind/compare/<pinned-commit>...main`.
2. For relevant fixes, apply the diff by hand (or `git apply` a patch for files we have not changed).
3. Do not blindly take upstream `package.json` changes — Dependabot already handles versions; only take
   new/removed dependencies that the applied code needs.
4. Run `npm run check && npm run build`, check the site, update the pinned commit above.

When AstroWind v2 (with an updatable integration) is released, evaluate migrating (backlog item).

## Dependency management

- **Package manager: npm** — AstroWind ships `package-lock.json` and documents npm; one tool keeps things simple.
- **Lockfile is the source of truth.** `package.json` keeps caret ranges; `package-lock.json` pins exact versions;
  CI uses `npm ci` (fails if lockfile and manifest disagree).
- **Node version** in `.nvmrc` (24, current LTS) is used by CI via `actions/setup-node` `node-version-file`.
  `engines.node` (`>=22.22.3`) is the minimum Astro 7 needs.
- **Fonts are dependencies too, but not npm packages:** Astro's Fonts API downloads them from Fontsource **at build
  time** (network access needed during the build) and bundles them into `dist/`.
- **Dependabot** (`.github/dependabot.yml`): weekly (Monday 06:00 Europe/Berlin) for `npm` and `github-actions`.
  Minor/patch updates are grouped (`astro`, `tailwind`, `lint-and-types`, `other-minor-and-patch`); majors arrive as
  separate PRs. Every PR runs CI (`check` + `build`).
- **TypeScript is held at 6.x:** TypeScript 7 (the native compiler) is not yet supported by `@astrojs/check`
  (peer `^5 || ^6`) and `typescript-eslint` (peer `<6.1`). Dependabot ignores `typescript >= 7` until both support it.
- **`overrides` in `package.json`** were inherited from upstream. They force patched versions of transitive
  dependencies (`yaml`, `sharp`/`svgo` under `astro-compress`, `nanoid` under `postcss`, `deepmerge-ts`, `fast-uri`)
  that the direct dependencies had not picked up yet. Review them occasionally (`npm ls <pkg>`) and drop an entry once
  the parent package depends on a fixed version by itself (backlog item).

## Visual design

### Palette — "Dark workshop", light variant

Derived from the sticker (walnut outline, maple/honey wood, cream background). The user picked the light version of
the "dark workshop" proposal: espresso text, dark walnut as primary, maple gold as accent.

| Token (CSS var)                                 | Hex                   | Use                                     |
| ----------------------------------------------- | --------------------- | --------------------------------------- |
| `--aw-color-bg-page`                            | `#F7F2EA`             | page background (warm off-white)        |
| `--fr-color-surface` (`bg-surface`, `.bg-band`) | `#ECE2D2`             | alternating section bands               |
| `--fr-color-card` (`bg-card`)                   | `#FFFFFF`             | cards                                   |
| `--fr-color-line` (`border-line`)               | `#DDD0BC`             | borders                                 |
| `--aw-color-text-heading` / `-default`          | `#17110C`             | text (espresso)                         |
| `--aw-color-text-muted`                         | `#6B5A4A`             | secondary text                          |
| `--aw-color-primary`                            | `#5C3010`             | buttons, links, icons (dark walnut)     |
| `--aw-color-secondary`                          | `#94601F`             | taglines, button hover (honey)          |
| `--aw-color-accent`                             | `#E3B866`             | decorative highlights only (maple gold) |
| `--fr-color-footer-bg` / `-text`                | `#17110C` / `#CDBBA3` | footer                                  |

- **Accessibility:** the proposal's honey `#A8702A` was deepened to `#94601F` because AstroWind uses `secondary` for
  small tagline text and as hover background behind white text (≈ 5.5 : 1 on the page background, AA). Maple gold has
  too little contrast for text on light backgrounds and is used only for decoration/backgrounds.
- **Light only.** No dark mode, no toggle (`ui.theme: light:only`, `.dark` tokens removed, `ApplyColorMode` removed).
  AstroWind components still contain `dark:` utility classes; they never activate because no `.dark` class is set.
  A full sweep to remove them is in the backlog.

### Typography

- **Headings:** Barlow Condensed 600–800, uppercase for `h1`/`h2` — echoes the bold condensed lettering of the sticker.
- **Body:** Inter (variable).
- Both are **self-hosted** via Astro's Fonts API (`astro.config.ts` → `fonts`, `<Font>` in `Layout.astro`). No
  request to Google Fonts or any other CDN at runtime (German courts have treated loading Google Fonts from Google's
  servers as a GDPR violation).

### Logo

- `design/logo-mark.svg`: simplified single-colour mark (spindle + end mill + wood block with cut), drawn with
  `currentColor` so it adapts to its context. Inline copy in `src/components/Logo.astro` with the wordmark.
- Favicons (`favicon.svg/.ico`, `apple-touch-icon.png`): cream mark on a walnut rounded square.
- The original sticker is used as the hero image; `og-default.png` (1200 × 628) is the sticker on cream.
- All derived assets are generated by `npm run brand:assets` (`scripts/generate-brand-assets.mjs`, uses `sharp`).

## Content & information architecture (v1)

One-page home with anchors plus legal pages:

| Route          | Content                                                                          |
| -------------- | -------------------------------------------------------------------------------- |
| `/`            | Hero (claim + sticker) · `#leistungen` (4 services) · `#ueber-mich` · `#kontakt` |
| `/impressum`   | Legal notice (§ 5 DDG, § 18 MStV) built from `src/data/business.ts`              |
| `/datenschutz` | Privacy policy (GitHub Pages hosting, email contact, no cookies/analytics)       |
| `/404`         | German not-found page (GitHub Pages serves `404.html` automatically)             |

- Formal address ("Sie") throughout.
- The blog stays technically available (routes in `src/pages/[...blog]/`, disabled in `config.yaml`). The content
  loader warns that `src/data/post` is empty — expected while the blog is off.

## Projects ("Projekte")

Portfolio section: overview at `/projekte`, one page per project at `/projekte/<slug>`, latest three on the home page.

- **Content model:** Astro content collection `projekte` (`src/content.config.ts`), `glob` loader over
  `src/data/projekte/*/index.md`. The entry id (= URL slug) is the folder name without its `YYYY-MM[-DD]-` prefix.
  `cover` uses the `image()` schema helper, so a missing cover fails the build. `draft: true` entries are filtered
  out in production (`getProjects()` in `src/utils/projects.ts`) but shown in `npm run dev`.
- **Gallery images:** _all_ JPEGs in the project folder, collected at build time with `import.meta.glob`
  (`getProjectImages()`); cover first, then by file name (numeric-aware). Captions are optional
  (`captions` map in the front matter) and double as alt text; otherwise a generic alt text is generated.
  Chosen over an explicit list in the front matter because adding a photo should be "drop the file in the folder".
- **Image pipeline:** originals are prepared by `npm run photos:prepare` (≤ 2400 px long edge, EXIF rotation applied,
  all metadata incl. GPS removed, mozjpeg q85; idempotent) to keep the repo small and avoid leaking locations.
  At build time Astro/Sharp generates WebP thumbnails (320/480 px), list/hero sizes (480–2000 px) and one ≈ 2000 px
  rendition per photo for the viewer (`getImage()` in `ProjectGallery.astro`).
- **Layouts** (chosen from mock-ups): overview = zigzag list (`ProjectListItem.astro`, cover 16:9 alternating sides);
  project page = hero + facts (`src/pages/projekte/[slug].astro`: 21:9 cover, Markdown story with inline photos,
  sticky `ProjectFacts.astro`, `ProjectGallery.astro`, optional `CustomerVoice.astro`, newer/older links);
  home teaser = `ProjectsTeaser.astro` (cards, hidden when there are no published projects).
- **Gallery viewer:** our own `ProjectGallery.astro`, adapted from AstroWind's `widgets/Gallery.astro` (native
  `<dialog>`, no library): ← → keys, swipe, Esc / click outside to close, caption + counter, neighbours preloaded.
  Upstream's viewer reuses the 640 px thumbnail, hence the separate large rendition. Without JS, thumbnails are plain
  links to the large image.
- **Social preview:** the cover is passed to AstroWind's `adaptOpenGraphImages` (renders a 1200 × 626 JPEG).

## Legal / privacy

- **Impressum** and **Datenschutzerklärung** are mandatory for a German business site; both exist from v1.
  Texts are drafts — the owner must complete `TODO(owner)` items and have them checked.
- **No cookies, no analytics, no third-party embeds** → no cookie banner required.
- **Contact** via `mailto:`/`tel:` only. A contact form needs a third-party form service or backend (GitHub Pages is
  static) and an update of the privacy policy (backlog).
- **Hosting:** GitHub Pages processes visitors' IP addresses (server logs); covered in the privacy policy.
- **Projects:** names, quotes (`testimonial`) and photos showing customers' instruments are published only with the
  customer's consent. `photos:prepare` strips EXIF/GPS metadata from photos before they are committed.

## Hosting & domain

- GitHub organisation `die-fraeserei`, repository `die-fraeserei/website` (public).
- Pages source: **GitHub Actions** (`deploy.yml`: `actions/upload-pages-artifact` + `actions/deploy-pages`).
- Apex domain `die-fraeserei.de` (A/AAAA records to GitHub Pages), `www` CNAME → `<org>.github.io`, GitHub redirects
  `www` → apex. `public/CNAME` contains the domain. Domain verified at organisation level. HTTPS enforced.
- `site: https://die-fraeserei.de` and `base: /` in `config.yaml` (no sub-path, because of the custom domain).

## Quality checks

- `npm run check`: `astro check` (TypeScript), ESLint, Prettier — run in CI on every PR.
- `npm run build` must succeed in CI before anything is deployed.
- Manual check after visual changes: desktop and 390 px mobile width, no horizontal scroll, no external requests
  (`grep -rhoE "https?://[a-zA-Z0-9.-]+" dist`).
