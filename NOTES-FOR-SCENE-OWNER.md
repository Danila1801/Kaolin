# Notes for the scene / header / globals.css owner

From the loc + a11y/SEO pass on branch `hermes/loc-a11y`. These touch files I
deliberately did **not** edit (they're yours). Nothing here is blocking; most of
it is confirmation that your surfaces are already in good shape.

## Em dashes still in code (copy owner cannot reach these)

The site owner asked to remove every em/en dash. I cleared all of them from
`messages/*.json` (all four locales are now dash-free). Three dashes still render
on the page from **non-message sources**, which are `.tsx`/`.ts` files I'm not
allowed to touch on the copy task. Please de-dash these to finish the job:

- **`components/scene/opengraph-image.tsx`** (or wherever `export const alt`
  lives): `alt = "kaolin — ai implementation studio"` renders into
  `og:image:alt` and `twitter:image:alt`. Suggest `"kaolin, ai implementation
  studio"` (matches the new `meta.title`).
- **`app/[locale]/layout.tsx`** Organization JSON-LD `description`:
  `"A father–son AI-implementation studio building websites..."` (en dash in
  `father–son`). Suggest `"A father and son AI-implementation studio..."`.
- **`components/LanguageSwitcher.tsx`** aria-labels: `"EN — English"`,
  `"NL — Nederlands"`, `"RO — Română"`, `"RU — Русский"`. Suggest a comma or
  just a space (`"EN English"` / `"EN, English"`).

None of these are in the message files, so they were out of scope for the copy
rewrite. Flagging so the "no dashes" rule holds site-wide.

## No action needed — verified clean

- **`app/globals.css` focus ring** — you already ship a global
  `:where(a, button, input, textarea, select, summary, [tabindex]):focus-visible`
  rule (2px solid `--color-forest`, 3px offset). Every interactive element,
  including the skip link I added, gets a visible focus indicator. No gap.
- **`components/scene/BotanicalCanvas.tsx`** — the fixed canvas wrapper already
  has `aria-hidden="true"` + `pointer-events-none`, and the copy is fully legible
  without it. The decorative scene is correctly hidden from assistive tech. No
  change needed.
- **Header / LanguageSwitcher / MobileMenu** — not modified. I added a
  skip-to-content link in `app/[locale]/layout.tsx` that lands *before* the
  header in the DOM and targets `<main id="main-content">`. It shouldn't
  interact with your header work, but flagging it so the DOM order isn't a
  surprise when you merge.

## Colour / contrast

- I found **no** contrast or colour-token problems in the section components
  (Services, Process, Proof, Pricing, Contact, TrustStrip) or the legal/error
  pages. Per CLAUDE.md the rust (`#a84c1a`) and muted (`#71614f`) values are the
  AA-passing ones and are used consistently. I changed **zero** colour/Tailwind
  colour classes anywhere, as agreed.
- One thing I could not verify without a browser + Lighthouse run: contrast of
  **ivory copy on the live day→sunset→night sky** inside `[data-scene-dark]`
  (Process/Proof) and over the sunset behind Services/Work. The static values
  look fine, but the sky is a live gradient you own — worth a real contrast check
  at a few scroll positions before launch. This is your domain, not something I
  touched.

## Optional (your call, not a defect)

- **Hero section nesting** in `app/[locale]/page.tsx`: `<section id="top">` wraps
  `<Section>` (which itself renders a `<section>`). Harmless — neither has an
  accessible name so neither becomes a landmark — but if you're already in that
  file for scene phases you may want to collapse it to one element. I left it
  alone to avoid colliding with your hero/scene classes.

## Shared repo blocker (not yours specifically)

- **`package-lock.json` is out of sync with `package.json`** — `npm ci` fails
  (`EUSAGE`: lockfile's `fs-extra@11.3.6` vs `9.1.0`, plus missing
  graphiql/codemirror/tinacms entries, almost certainly from the "add TinaCMS
  admin panel" commit). `npm install` regenerates it fine and the build passes,
  but CI/Vercel using `npm ci` would break. Recommend a dedicated
  `npm install` + commit-the-lockfile change on `design/botanical`. I did **not**
  fold that into my branch (out of scope, and it's a shared file that would
  conflict), so my diff leaves the lockfile untouched.
