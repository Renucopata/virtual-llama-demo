# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A pitch demo for a client (Virtual Llama, a bilingual nearshore call center in Bolivia). It redesigns their current site (virtuallama.com, which runs on WordPress + Elementor) as a static Astro site. If the client signs, this repo also serves as a reusable template for other clients, so keep client-specific data out of components.

Copy is written originally for this project. Do not paste text, logos or images from the live virtuallama.com site; the client's own assets get dropped into `public/` by the user.

## Commands

```bash
npm run dev       # dev server at http://localhost:4321 (Spanish at /es/)
npm run build     # static build to dist/ (+ sitemap)
npm run preview   # serve dist/
npm run check     # astro check (type-checks .astro and .ts)
```

There are no tests or linter configured. `npm run build` does not type-check TSX; run `npm run check` after editing `src/portal/`.

## Stack

Astro 7 (static output), Tailwind CSS 4 via `@tailwindcss/vite` (no tailwind.config file: tokens live in CSS), self-hosted fonts via Fontsource, `@astrojs/sitemap`. The marketing pages use no UI framework (interactivity is small inline `<script>` blocks). Only the demo portal uses Preact (`@astrojs/preact`) islands.

## Architecture

Two pages, each rendered once per language. Route files in `src/pages/` (and `src/pages/es/`) only pick the language:

- `/` → `src/components/Home.astro`: the landing page, composing all sections in page order.
- `/apply/` → `src/components/ApplyPage.astro`: opened by the hero's "Start your journey" button. It first asks whether the visitor wants to **work at** Virtual Llama (`agent`) or **hire** it (`company`), then shows that path's form. The choice lives in `?type=agent|company` (pushState, back button works), so each form is directly linkable. Form fields are data in `t.apply.forms[path].fields`, rendered by `FormFields.astro`; add or change fields in the dictionaries, not the component.
- Use `localePath(lang, slug)` from `src/i18n/index.ts` for internal URLs. Pages pass `slug` to `Base` (canonical/hreflang) and `Header` (language switch stays on the same page). Nav anchors are prefixed with the home path so they work from `/apply/` too.
- Every section component takes the whole dictionary as a `t: Dict` prop and reads its own slice (`t.hero`, `t.services`, ...). Components contain no user-facing strings.

### Demo portal (`/login/`, `/portal/`, `/admin/`)

A **frontend-only demo**: there is no backend, database or real auth. Do not treat it as secure.

- Route files render `src/components/PortalPage.astro` with `app="login" | "portal" | "admin"`, which mounts `src/portal/LoginApp.tsx`, `AgentApp.tsx` or `AdminApp.tsx` with `client:only="preact"` (they read browser storage, so they can't be server-rendered). These pages get `noindex` and are filtered out of the sitemap in `astro.config.mjs`.
- `src/portal/data.ts`: all sample data and types. It covers 10 agents, 5 clients, 4 admin users, the role/permission matrix, custom field definitions and `DEMO_ACCOUNTS` (2 agents, 2 admins, password `demo123`). Payment dates are generated relative to today in `buildSeed()`, so "upcoming" is always current.
- `src/portal/store.ts`: the "database" is the seed copied into `localStorage` (`vl-demo-db`). Admin edits persist there and show up on the agent profile; bump `DB_VERSION` when the data shape changes. The session lives in `sessionStorage` (`vl-demo-session`). Also holds formatting helpers (`money`, `date`, `loc` for `{en, es}` values).
- Admin permissions are enforced only in the UI via `can(db, role, permission)`. The `superadmin` column is locked so the demo can't lock itself out.
- "Export to Excel" writes a real `.xlsx` with `write-excel-file/browser`, loaded with a dynamic import on click.
- Portal strings live in `src/i18n/portal.ts` (`PortalDict`, with `{placeholder}` filled by `fmt()`), separate from the marketing `Dict`.
- Shared UI pieces (`Card`, `Badge`, `AppBar`, ...) are in `src/portal/ui.tsx`. Icon paths are shared with `Icon.astro` through `src/components/icons.ts`.

Content and branding live in three places. Re-skinning for a new client means editing only these:

1. `src/i18n/en.ts` / `src/i18n/es.ts`: all copy. Both must satisfy the `Dict` interface in `src/i18n/types.ts`; adding a field means updating the type and both dictionaries.
2. `src/config/brand.ts`: language-independent facts (name, email, phone, WhatsApp, socials). Contains TODOs for unconfirmed client data.
3. `@theme` block in `src/styles/global.css`: colours and fonts, used as Tailwind utilities. Palette comes from `brand-guidelines/colors.jpeg`: `ink` #0c0c16 (main), `primary` #6666ff (secondary), `lavender` #b8baff and `sky` #c9e8ff (complementary), `mint` #b9f0d7 (use sparingly: only the hero "live" dot and form success). `paper`, `graphite` and `muted` are derived neutrals. Fonts: `font-heading`/`font-sans` = Plus Jakarta Sans (titles and body), `font-display` = Bebas Neue (large display text only: the hero `h1`, stats, mobile menu, service numbers).
4. `public/brand/`: logo exports. `Logo.astro` takes `variant="full" | "mark"` (llama only) and `tone="light" | "dark"`. The header is always dark because the logo is white. Favicons are `public/favicon-*.png` and `apple-touch-icon.png`.

Other conventions:

- **Icons**: `src/components/Icon.astro` holds inline SVG path data keyed by name. Dictionary items reference icons by these keys; unknown keys fall back to `plus`.
- **Shared classes** (`container-x`, `eyebrow`, `btn`, `btn-dark`, `btn-light`, `btn-ghost`) are defined with `@utility` in `global.css`. In Tailwind 4 a class must be an `@utility` (not a plain class in `@layer components`) to be usable inside another `@apply`.
- **Scroll animations**: add `data-reveal` to any element (optionally `style="--reveal-delay:120ms"`). The IntersectionObserver lives in `src/layouts/Base.astro`. Respects `prefers-reduced-motion`.
- **i18n routing**: configured in `astro.config.mjs` with `prefixDefaultLocale: false`. `altPath()` in `src/i18n/index.ts` gives the other language's URL for the switcher. `Base.astro` emits canonical/hreflang tags and Organization JSON-LD; `Faq.astro` emits FAQPage JSON-LD.
- **Forms**: every `<form data-ajax-form>` is wired by `initAjaxForms()` in `src/scripts/forms.ts` (messages from `data-sending/success/error`, result shown in its `[data-form-status]` element). They post to `PUBLIC_FORM_ENDPOINT` (see `.env.example`, e.g. Formspree) with a hidden `form_type` field (`contact`, `agent` or `company`) to tell submissions apart. When the endpoint is unset, forms run in demo mode and fake a successful submit without sending data.
