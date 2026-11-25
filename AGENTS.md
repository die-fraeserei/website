# Agent instructions — die-fraeserei.de

Website of "Die Fräserei" (CNC milling: guitar parts, woodworking parts). Astro 7 + Tailwind CSS 4, based on a pinned
copy of the AstroWind template, deployed to GitHub Pages.

- **Site content: German** (formal "Sie"). **Code, comments, commits and docs: English.**
- Read [`docs/design.md`](docs/design.md) (architecture, decisions, customisation map) and
  [`docs/plan.md`](docs/plan.md) (backlog) before larger changes. Update both when decisions or scope change.

## Commands

| Command                | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `npm ci`               | Install dependencies exactly as locked         |
| `npm run dev`          | Dev server at localhost:4321                   |
| `npm run check`        | astro check + ESLint + Prettier (CI runs this) |
| `npm run fix`          | Auto-fix ESLint + Prettier                     |
| `npm run build`        | Production build to `dist/` (CI runs this)     |
| `npm run brand:assets` | Regenerate favicons / OG image / sticker copy  |

Always run `npm run check && npm run build` after changes.

## Conventions

- **npm only**, never commit other lockfiles. Add dependencies sparingly; Dependabot keeps them updated.
- **Light only:** do not add dark-mode styles or a theme toggle.
- **No external runtime requests** (fonts, images, scripts, embeds) — GDPR. Fonts go through Astro's Fonts API.
- **Colours:** use the tokens (`text-primary`, `bg-surface`, `bg-card`, `border-line`, `text-muted`, …) defined in
  `src/components/CustomStyles.astro` and `src/assets/styles/fraeserei.css`; no hard-coded colours.
- **Upstream code:** prefer adding our own components in `src/components/fraeserei/` over editing AstroWind files.
  If an upstream file must change, record it in the customisation map in `docs/design.md`.
- **Business data** (address, email, phone, legal) only in `src/data/business.ts`.
- Any feature that processes personal data (forms, analytics, maps) requires updating `src/pages/datenschutz.astro`.

## AstroWind reference

- Site config: `src/config.yaml` → virtual module `astrowind:config` (`SITE`, `I18N`, `METADATA`, `APP_BLOG`, `UI`).
- Path alias `~/` → `src/`.
- Widgets (`src/components/widgets/`): `Hero`, `Features`, `Content`, `Steps`, `FAQs`, `CallToAction`, … — props in
  `src/types.d.ts`; wrap custom sections in `WidgetWrapper` + `Headline` (`src/components/ui/`).
- Images: `src/components/common/Image.astro` (local images optimised by Sharp to WebP).
- Icons: `astro-icon` with the Tabler set (`tabler:<name>`).
- Upstream how-to guides for common tasks: `.agents/skills/` (written for the generic template — check against our
  conventions above, e.g. ignore dark-mode advice).
