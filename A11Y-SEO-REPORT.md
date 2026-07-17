# Accessibility + SEO / Localization report

Branch: `hermes/loc-a11y` · scope: localization QA (Task 3) and a11y/SEO hardening
(Task 4). Verified with `tsc --noEmit` (clean), `next build` (clean, all four
locales + sitemap/robots/OG images prerendered), and inspection of the
prerendered HTML for `lang`, headings, hreflang, and the skip link.

---

## Task 3 — Localization QA (`messages/{en,nl,ro,ru}.json`)

**Overall: the translations were in excellent shape.** Automated + manual review
against `en.json` found one real fix; everything else verified correct.

### Verified

| Check | Result |
|---|---|
| Valid JSON (all four) | ✅ `node -e "require(...)"` passes for each |
| Key parity vs `en.json` | ✅ 185 leaf keys each, 0 missing / 0 extra |
| ICU placeholder drift | ✅ none — `en.json` has no `{…}` placeholders to drift |
| RO comma-below `ș`/`ț` (not cedilla `ş`/`ţ`) | ✅ 0 cedilla forms, 201 correct comma-below |
| RU genuine Cyrillic | ✅ 0 mojibake (`Ð/Ñ/â`), 0 Latin look-alikes inside Cyrillic words |
| Untranslated English leftovers | ✅ none (RU fully translated; NL/RO "identical" strings are legitimate cognates: *contact, menu, websites, privacy, Legal*, proper names) |
| SEO `meta.title` / `meta.description` per locale | ✅ read naturally in all four |

Notes on things that *look* suspicious but are correct:
- RU "mixed-script" tokens (`AI-ассистент`, `IP-адрес`, `llm-ассистент`) are
  standard Russian tech-abbreviation-plus-Cyrillic-suffix forms, not corruption.
- RU keeps `cookie` and legal-citation letters (`ст. 6(1)(b) и (f)`) in Latin —
  standard professional usage.
- Thousands separators are locale-correct: RU `€1 500` (space), NL/RO `€1.500`
  (dot).

### Fixed

- **`nl.json` › `trust.line`**: `vader-zoon studio` → `vader-zoonstudio`. Dutch
  orthography closes this compound; `meta.description` and `legal.terms` already
  used the closed form, so this was the lone inconsistent outlier.
  (commit `i18n(nl): fix vader-zoon compound spelling`)

---

## Task 4 — Accessibility + SEO hardening

**Overall: the in-scope surfaces were already built with strong a11y hygiene.**
The changes below are targeted improvements, not fixes for broken code.

### Changed

1. **Localized skip-to-content link** — `app/[locale]/layout.tsx`
   (+ `nav.skipToContent` in all four locales).
   First focusable element in `<body>`, visually hidden until focused
   (`sr-only` → `focus:not-sr-only`, using existing `ink`/`cream` tokens — no new
   colours). Targets `<main id="main-content" tabIndex={-1}>`. Addresses
   WCAG 2.4.1 *Bypass Blocks*: keyboard users previously had to tab through the
   sticky header + language switcher to reach content.
   Rendered text verified per locale: *Skip to content / Naar de inhoud /
   Sari la conținut / Перейти к содержимому*.
   (commit `a11y: add localized skip-to-content link`)

2. **Sitemap `x-default` hreflang** — `app/sitemap.ts`.
   The sitemap built its own alternates map and omitted `x-default`, which the
   per-page `<head>` alternates (via `lib/site.ts` `localeAlternates()`) already
   emit. Refactored the sitemap to reuse that same helper, so both stay identical
   and DRY. Verified: 16 sitemap URLs each now carry the `x-default` alternate.
   (commit `seo: emit x-default hreflang in sitemap`)

### Audited and found correct (no change)

- **`app/[locale]/layout.tsx`** — `<html lang={locale}>` correct per locale;
  canonical + hreflang (en/nl/ro/ru + x-default) present; OG/Twitter metadata and
  locale mapping correct; Organization JSON-LD is conservative and its
  `[PENDING]` (KVK / address / VAT deliberately omitted) is documented — left
  untouched, no facts invented.
- **`app/[locale]/opengraph-image.tsx`** — has `alt`; documented Latin-only
  rendering (the built-in font lacks Cyrillic / `ș`,`ț`) is the right call to
  avoid tofu. Generated per locale in the build.
- **`app/sitemap.ts` / `app/robots.ts` / `lib/site.ts`** — correct across all
  four locales; robots allows all + points at the sitemap + sets host.
- **Legal pages + `components/legal/LegalDoc.tsx`** — correct landmark/heading
  order (`h1` → `h2` per section), discernible "back home" link, `[PENDING]`
  legal placeholders documented.
- **`app/[locale]/error.tsx`, `not-found.tsx`, `app/global-error.tsx`** —
  single `h1`, discernible button/link text, `lang="en"` on the standalone
  global-error document (documented English-only by design).
- **Section components** (Services, Process, Proof, Pricing, Contact,
  ContactForm, TrustStrip) — semantic HTML is solid:
  - Heading order across the home page is clean: one `<h1>` (hero) → `<h2>` per
    section → `<h3>` per item. Verified in prerendered HTML.
  - Decorative elements are correctly `aria-hidden`: hero kicker dot / `×` /
    `↘` arrows / `hero-meta`, TrustStrip dashes, Contact `---`, Pricing `✓`,
    Footer logo SVG.
  - `ContactForm` is exemplary: real `<label>`-wrapped inputs, `autoComplete`,
    `required`, honeypot with `aria-hidden` + `tabIndex={-1}`, `role="status"`
    on success and `role="alert"` on error.
  - Pricing feature lists use real `<ul>`/`<li>`; Proof uses `<article>` per
    person; Footer legal links are wrapped in `<nav aria-label>`.

### Considered but intentionally not done

- **List semantics for the Services rows / Process steps.** These render as
  repeated `<div>`s wrapped in the `<Reveal>` animation component. Adding
  `role="list"`/`role="listitem"` would break the required list→listitem
  parent-child relationship (the `<Reveal>` `<div>` sits between them), and making
  `<Reveal>` emit `<ul>`/`<li>` is a shared-component change that risks layout and
  overlaps the scene owner's animation work. They already have correct heading
  structure, so this is an enhancement, not a WCAG failure. Left for a future
  pass that owns `Reveal`.

### Lighthouse-relevant notes

- Expected to clear the ≥95 a11y bar: landmarks (`header`/`main`/`footer`/`nav`),
  clean heading order, labelled controls, global `:focus-visible`, `lang` set,
  reduced-motion respected (`Reveal`, `BotanicalCanvas`). Skip link is a bonus.
- SEO: canonical + full hreflang (now including x-default in both `<head>` and
  sitemap), robots, per-locale OG image, localized titles/descriptions.
- **Could not run Lighthouse or a live contrast check** in this environment (no
  browser). The one contrast surface I could not statically clear — ivory copy
  over the *live* day/sunset/night sky gradient — is the scene owner's domain and
  is flagged in `NOTES-FOR-SCENE-OWNER.md`.

### Items outside my file ownership

See **`NOTES-FOR-SCENE-OWNER.md`** — short summary: `globals.css` focus ring and
`BotanicalCanvas` `aria-hidden` are already correct (verified, no action); the
live-sky contrast check is the owner's; and there is a shared, pre-existing
`package-lock.json` / `package.json` out-of-sync issue that breaks `npm ci`
(`npm install` works) and should be fixed with a dedicated lockfile commit on
`design/botanical`.

---

## Verification commands

```
node -e "require('./messages/<locale>.json')"   # all four: valid JSON
./node_modules/.bin/tsc --noEmit                 # clean
./node_modules/.bin/next build                   # clean; 4 locales + sitemap/robots/OG
```

(Dependencies had to be installed with `npm install`, not `npm ci`, due to the
lockfile issue noted above; the regenerated lockfile was reverted so this branch
carries no `package-lock.json` change.)
