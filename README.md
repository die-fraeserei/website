# die-fraeserei.de

Website of **Die Fräserei**, a small CNC milling business making guitar parts and parts for woodworking.
The site is in German; all development documentation is in English.

- **Live:** https://die-fraeserei.de
- **Stack:** [Astro 7](https://astro.build) · [Tailwind CSS 4](https://tailwindcss.com) · based on the
  [AstroWind](https://github.com/arthelokyo/astrowind) template
- **Hosting:** GitHub Pages (deployed by GitHub Actions), custom domain
- **Docs:** [`docs/design.md`](docs/design.md) (architecture & decisions) · [`docs/plan.md`](docs/plan.md) (backlog)

## Prerequisites

- Node.js — the version in [`.nvmrc`](.nvmrc) (CI uses exactly this one; `>=22.22.3` works locally)
- npm (ships with Node). **npm is the only supported package manager.**

## Getting started

```sh
npm ci            # install exactly what package-lock.json specifies
npm run dev       # dev server at http://localhost:4321
```

## Scripts

| Command                | What it does                                                          |
| ---------------------- | --------------------------------------------------------------------- |
| `npm run dev`          | Start the dev server with hot reload                                  |
| `npm run build`        | Production build into `dist/`                                         |
| `npm run preview`      | Serve the production build locally                                    |
| `npm run check`        | `astro check` (types) + ESLint + Prettier — the same checks CI runs   |
| `npm run fix`          | Auto-fix ESLint and Prettier issues                                   |
| `npm run brand:assets` | Regenerate favicons, OG image and sticker copy from `design/`/`docs/` |

## Project structure

```
.github/
  workflows/ci.yml          # PRs + main: npm ci → check → build
  workflows/deploy.yml      # main: build → deploy to GitHub Pages
  dependabot.yml            # weekly, grouped npm + GitHub Actions updates
design/logo-mark.svg        # source of the simplified logo mark
docs/                       # design.md, plan.md, sticker.png (original artwork)
public/CNAME                # custom domain for GitHub Pages
scripts/                    # generate-brand-assets.mjs
src/
  config.yaml               # site settings (name, URL, SEO, language, blog off, light-only)
  navigation.ts             # header + footer links
  data/business.ts          # business/contact/legal data (single source of truth)
  components/CustomStyles.astro      # colour + font tokens
  components/Logo.astro              # header logo (SVG mark + wordmark)
  components/fraeserei/              # our own components (footer, about, contact)
  assets/styles/fraeserei.css        # our Tailwind additions
  pages/index.astro                  # home page (hero, services, about, contact)
  pages/impressum.astro, datenschutz.astro, 404.astro
vendor/integration/         # AstroWind's config loader (upstream code)
```

Everything else under `src/` is AstroWind template code; we change it as little as possible
(see "Customisation map" in [`docs/design.md`](docs/design.md)).

## Editing content

- **Business details** (name, address, email, phone, VAT ID): `src/data/business.ts`. Used by the footer, contact
  section, Impressum and Datenschutz. Search for `TODO(owner)` to find all placeholders.
- **Home page texts:** `src/pages/index.astro`, `src/components/fraeserei/*.astro`.
- **Colours / fonts:** `src/components/CustomStyles.astro` and `astro.config.ts` (`fonts`).
- **Logo:** edit `design/logo-mark.svg`, update the inline copy in `src/components/Logo.astro`, then run
  `npm run brand:assets`.

## Deployment

Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes `dist/` to GitHub
Pages. Pull requests run `.github/workflows/ci.yml` only.

### One-time setup

1. GitHub organisation `die-fraeserei`, repository [`die-fraeserei/website`](https://github.com/die-fraeserei/website); push `main`.
2. **Verify the domain** for the organisation (Org settings → Pages → _Add a domain_) by adding the TXT record GitHub
   shows. This prevents domain takeover.
3. Repository → Settings → Pages → _Build and deployment_ → Source: **GitHub Actions**.
4. DNS records at the domain provider:

   | Name                                    | Type  | Value                                                                                      |
   | --------------------------------------- | ----- | ------------------------------------------------------------------------------------------ |
   | `@`                                     | A     | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`                 |
   | `@`                                     | AAAA  | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
   | `www`                                   | CNAME | `die-fraeserei.github.io.` (the organisation's Pages host)                                 |
   | `@`                                     | CAA   | `0 issue "letsencrypt.org"` (GitHub Pages certificates come from Let's Encrypt)            |
   | `_github-pages-challenge-die-fraeserei` | TXT   | value shown by GitHub in step 2                                                            |

   DNS is hosted at Hetzner (`*.ns.hetzner.com`); the records can be imported as a zone file in the Hetzner Console.

5. Settings → Pages → Custom domain: `die-fraeserei.de` (already set via `public/CNAME`), then tick
   **Enforce HTTPS** once the certificate is issued. GitHub redirects `www` to the apex automatically.

## Dependencies & updates

- `package-lock.json` is committed and is the source of truth; CI always runs `npm ci`.
- **Dependabot** opens grouped PRs every Monday (Astro, Tailwind, lint/types, everything else; GitHub Actions
  separately). Majors come as individual PRs. Merge when CI is green; for majors read the changelog first.
- **AstroWind** is not an npm package — it was copied in at a pinned commit. See
  [`docs/design.md`](docs/design.md#updating-from-upstream-astrowind) for how to pull in upstream fixes.

## License

Site content and branding © Die Fräserei. Template code from AstroWind is MIT-licensed, see [`LICENSE.md`](LICENSE.md).
