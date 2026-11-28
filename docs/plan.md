# Plan & backlog

Architecture and decisions: see [`design.md`](design.md).

## Iteration 1 — business card (current)

- [x] Import AstroWind at a pinned commit; remove demo content and unused dependencies
- [x] Theme: "Dark workshop – light" palette, Barlow Condensed + Inter (self-hosted), light only
- [x] Logo mark (SVG), favicons, OG image
- [x] Home page: hero, Leistungen, Über mich, Kontakt
- [x] Impressum, Datenschutz, 404 (German)
- [x] GitHub workflows: CI, deploy to Pages; Dependabot; `CNAME`
- [x] Docs: README, design.md, plan.md, AGENTS.md
- [ ] **Owner:** fill in `src/data/business.ts` and other `TODO(owner)` items (`grep -rn "TODO(owner)" src`)
- [ ] **Owner:** review texts (claims, services, about, facts) and the legal pages
- [x] GitHub org + repo, Pages (GitHub Actions), domain verified, DNS at Hetzner
- [ ] First push to `main`, enforce HTTPS
- [ ] Check the live site (HTTPS, `www` redirect, social preview, favicon)

## Backlog

Roughly in priority order.

### Content

- [ ] Real photos: workshop, machine, finished parts (hero/about), with alt texts
- [ ] Gallery / "Referenzen" with project photos
- [ ] Detail pages per service (Gitarrenteile, Schablonen, Werkstattzubehör, Sonderanfertigungen)
- [ ] FAQ (file formats, materials, lead times, pricing basics, shipping) — AstroWind `FAQs` widget adds FAQPage structured data
- [ ] Price information / "So läuft ein Auftrag ab" (process steps — `Steps` widget)

### Features

- [ ] Contact form (e.g. Web3Forms/Formspree or own endpoint) with spam protection; update Datenschutz
- [ ] Shop or product catalogue (e.g. standard templates)
- [ ] Blog / "Werkstatt-Notizen" (re-enable AstroWind blog, add MDX back if needed)
- [ ] Privacy-friendly analytics (self-hosted/cookieless); update Datenschutz
- [ ] English version (i18n)
- [ ] Social links (Instagram etc.) in footer

### Design

- [ ] Full dark-mode removal: delete `dark:` classes, `ToggleTheme.astro`, `ApplyColorMode.astro`, theme option in
      `vendor/integration` and the `@variant dark` in `tailwind.css`
- [ ] Refine logo mark (end-mill flutes, wood block perspective) — possibly a professional vector version
- [ ] Subtle wood texture/grain accents (e.g. section dividers) without hurting the clean look
- [ ] Optimise `og-default.png` (claim text next to the sticker)

### Engineering

- [ ] Dependabot auto-merge for patch updates when CI is green
- [ ] Lighthouse / accessibility checks in CI (e.g. `lhci`, `pa11y`)
- [ ] `actionlint` in CI for workflow files
- [ ] Pin GitHub Actions to commit SHAs (Dependabot keeps them updated)
- [ ] Review inherited `overrides` in `package.json`; drop entries no longer needed
- [ ] TypeScript 7: once `@astrojs/check` and `typescript-eslint` accept 7.x, remove the `ignore` rule in
      `.github/dependabot.yml` and upgrade
- [ ] Remove unused AstroWind widgets/components and the `flat-color-icons` icon set
- [ ] Migrate to AstroWind v2 integration once released
