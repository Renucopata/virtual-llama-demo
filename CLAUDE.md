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

There are no tests or linter configured.

## Stack

Astro 7 (static output), Tailwind CSS 4 via `@tailwindcss/vite` (no tailwind.config file: tokens live in CSS), self-hosted fonts via Fontsource (Lexend Peta for display, Lexend for body), `@astrojs/sitemap`. No UI framework: interactivity is small inline `<script>` blocks in components.

## Architecture

Two pages, each rendered once per language. Route files in `src/pages/` (and `src/pages/es/`) only pick the language:

- `/` → `src/components/Home.astro`: the landing page, composing all sections in page order.
- `/apply/` → `src/components/ApplyPage.astro`: opened by the hero's "Start your journey" button. It first asks whether the visitor wants to **work at** Virtual Llama (`agent`) or **hire** it (`company`), then shows that path's form. The choice lives in `?type=agent|company` (pushState, back button works), so each form is directly linkable. Form fields are data in `t.apply.forms[path].fields`, rendered by `FormFields.astro`; add or change fields in the dictionaries, not the component.
- Use `localePath(lang, slug)` from `src/i18n/index.ts` for internal URLs. Pages pass `slug` to `Base` (canonical/hreflang) and `Header` (language switch stays on the same page). Nav anchors are prefixed with the home path so they work from `/apply/` too.
- Every section component takes the whole dictionary as a `t: Dict` prop and reads its own slice (`t.hero`, `t.services`, ...). Components contain no user-facing strings.

Content and branding live in three places. Re-skinning for a new client means editing only these:

1. `src/i18n/en.ts` / `src/i18n/es.ts`: all copy. Both must satisfy the `Dict` interface in `src/i18n/types.ts`; adding a field means updating the type and both dictionaries.
2. `src/config/brand.ts`: language-independent facts (name, email, phone, WhatsApp, socials). Contains TODOs for unconfirmed client data.
3. `@theme` block in `src/styles/global.css`: colours and fonts, used as Tailwind utilities (`bg-cream`, `text-ink`, `font-display`, ...).

Other conventions:

- **Icons**: `src/components/Icon.astro` holds inline SVG path data keyed by name. Dictionary items reference icons by these keys; unknown keys fall back to `plus`.
- **Shared classes** (`container-x`, `eyebrow`, `btn`, `btn-dark`, `btn-light`, `btn-ghost`) are defined with `@utility` in `global.css`. In Tailwind 4 a class must be an `@utility` (not a plain class in `@layer components`) to be usable inside another `@apply`.
- **Scroll animations**: add `data-reveal` to any element (optionally `style="--reveal-delay:120ms"`). The IntersectionObserver lives in `src/layouts/Base.astro`. Respects `prefers-reduced-motion`.
- **i18n routing**: configured in `astro.config.mjs` with `prefixDefaultLocale: false`. `altPath()` in `src/i18n/index.ts` gives the other language's URL for the switcher. `Base.astro` emits canonical/hreflang tags and Organization JSON-LD; `Faq.astro` emits FAQPage JSON-LD.
- **Forms**: every `<form data-ajax-form>` is wired by `initAjaxForms()` in `src/scripts/forms.ts` (messages from `data-sending/success/error`, result shown in its `[data-form-status]` element). They post to `PUBLIC_FORM_ENDPOINT` (see `.env.example`, e.g. Formspree) with a hidden `form_type` field (`contact`, `agent` or `company`) to tell submissions apart. When the endpoint is unset, forms run in demo mode and fake a successful submit without sending data.
