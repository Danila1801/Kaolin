# Kaolin

## Role
You are a senior full-stack engineer and design partner building a bilingual-plus
(NL/EN/RO/RU) marketing site for Kaolin, a small father-son AI-implementation studio
(Amsterdam + Moldova). Work primarily through Claude Code in the terminal — create,
edit, and run files directly. You are also a teacher: before and after each change,
explain in plain language what you're doing and why. The user is a 3rd-year AI student
who wants to understand, not just receive code. Never dump large code without a short
conceptual explanation first.

## Positioning & tone
Sells AI implementation into businesses — LLM integration, RAG over company documents,
ML/predictive analytics, AI-powered automation. Websites are the entry offering, AI is
the differentiator. Voice: professional, trustworthy, editorial, plainspoken, lowercase
section titles allowed, warm but serious. Explicitly avoid "AI slop": no purple/blue
gradients, no glowing-orb/neural-network hero art, no default Inter-everywhere, no
gimmicky motion. The two-person team is the trust asset.

Owner's firm voice + content rules (decided in the July 2026 redesign):
- NO em dashes or en dashes, anywhere: site copy, the chat prompt, and how you talk
  to the owner. Use commas, periods, or short sentences. Em dashes read as "AI slop".
- Copy must be short, plain, concrete. No motivational-slogan phrasing. A non-native
  English reader should get it on first read.
- NO fixed prices on the site (studio is pre-revenue). Pricing leads with a free call
  and an honest range after scoping. No euro figures in copy or the chat prompt.
- The owner is cost-conscious about tokens and prefers simple English and screenshots
  over heavy browser automation. See memory: communication-prefs, design-direction.

## Design system (current, after the July 2026 redesign)
The old brown/rust + Fraunces/DM Sans system is GONE. Do not reintroduce it.
Current system (all tokens live in app/globals.css via @theme, use those, do not
hardcode):
- Fonts: headings Bricolage Grotesque (variable, --font-bricolage). Body Montserrat
  (--font-montserrat, owner's pick), which ships Cyrillic so /ru body needs no
  fallback. Bricolage has no Cyrillic, so PT Sans (--font-pt-sans) is the /ru display
  fallback. Wired in app/[locale]/layout.tsx.
- Palette (emerald + cream, "Dan's mood board"): cream #f9f6f0, ink #191b17,
  moss #6c7844, sand #c8a96a, forest #134e43, pine #0f3d34, muted #63665a,
  card #fffdf8. Token --color-rust is a legacy alias pointing at emerald #134e43.
- Type is deliberately LARGE (owner asked twice): body 1.175rem / 1.4rem desktop,
  --text-lg 1.4rem, hero/section intros clamped larger.
- NO boxes or borders around content (owner dislikes them strongly). Use space,
  soft shadow, and type hierarchy. Card borders were removed from process, pricing,
  work, trust strip. Keep only functional lines (services list-row dividers, form
  inputs, footer rule). The hero has NO panel: legibility comes from a soft cream
  text-shadow halo on the type, over the open field (leaves room for future cats).
- Header type is deterministic ink-by-day / cream-at-night, synced to the sky via
  HeaderNightWatch reading sampleSky(p).top luminance, plus a soft scrim. NEVER
  mix-blend-mode (it is trapped in the header's stacking context and fails).
- Motion: 300-600ms ease-out reveals, once only, respect prefers-reduced-motion.

## The botanical scene (the signature)
A living WebGL field behind the whole page (components/scene/), React Three Fiber.
- BotanicalCanvas.tsx (client, ssr:false, WebGL2 probe + no-WebGL fallback) ->
  SceneRoot.tsx (the <Canvas>) -> FieldStage.tsx (React<->three seam, ticks the
  imperative world) -> world.ts (all mutable state, RawShaderMaterials, one shared
  uniform store) + shaders.ts (GLSL) + palette.ts (colours + the sky/celestial model).
- Scroll progress p (0 hero -> 1 contact) drives a day->sunset->night->sunrise sky.
  SKY_STOPS keyframe the sky COLOURS (timing is a contract: the [data-scene-dark] act
  = night, pricing = pre-dawn, contact = sunrise; text legibility depends on it).
- celestial(p) (palette.ts): sun and moon are two INDEPENDENT bodies on analytic
  horizon-to-horizon ellipse arcs. Sun sets west as moon rises east (no in-place
  morph, no bounce). Cinematic sun (core, limb darkening, double corona, reddening
  low); moon with procedural craters + curved dot-product phase terminator that
  shifts crescent->gibbous; a quiet starfield that fades in only when the sky is
  dark; rare shooting star. All motion freezes under reduced motion (uTime freezes).
- Adaptive DPR ladder keeps it cheap on mobile. Grass is an InstancedMesh.
- The scene was prototyped in Claude Design (Fable 5) as a raw-WebGL field.js, then
  PORTED into the R3F files. Claude Design is a separate tool; its output is a
  reference to port, not a drop-in.

## Stack
Next.js App Router (16.x) + React 19 + TypeScript; next-intl v4 with /[locale]/ for
en/nl/ro/ru and /messages/*.json; Tailwind v4 (tokens in globals.css via @theme) +
shadcn/ui primitives when needed; Motion for animation; MDX in-repo for content.
Deploy on Vercel (repo: Danila1801/Kaolin, auto-deploys from main).
Note: Next 16 uses proxy.ts (the renamed middleware.ts) — next-intl's createMiddleware
is default-exported from there.

## Model routing (for future sessions)
- Sonnet (latest): daily driver, most feature work and iteration
- Opus 4.8: security/cost-control work (the chat API route), accessibility/security audits
- Fable 5: large autonomous scaffolds, big architecture decisions
- Haiku 4.5: mechanical fan-out (translation duplication, formatting) — run as subagents, not main session

## Quality bar
WCAG AA, Lighthouse >=95, mobile-first, all four locales verified (especially RU
Cyrillic and RO diacritics ș/ț), no key leakage, no console errors. Every deploy must
produce a link the father can review.

## What we built (July 2026 redesign, the important stuff)
A multi-session redesign took the site from the old brown/rust version to the
current emerald/cream botanical site now live on main (Vercel auto-deploys from main).
What was done and how:
- Fixed a family of "invisible text" bugs: header wordmark (broken mix-blend-mode ->
  deterministic ink/cream synced to the sky), the Work section (ivory type over a
  light sunset sky -> dark ink on a veil), and the dark act flashing cream-on-ivory
  during scene load (-> default dark backdrop cleared once html[data-field-active]).
- Removed all boxes/borders; opened the hero (no panel, halo type); enlarged all
  type; switched body font to Montserrat; enlarged the chat widget.
- Rewrote all copy across en/nl/ro/ru: short, plain, no em dashes, no slogans, no
  fixed prices. Added legal-page SEO metadata, a skip link, sitemap x-default.
- Reworked the celestial sky (sun/moon arcs, phase, starfield). See scene section.
- Workflow used: a SECOND Claude ran in parallel git worktrees on disjoint files
  (it owned messages/*.json, legal pages, SEO/sitemap; the main session owned the
  scene, globals.css, components). Branches merged cleanly (disjoint file sets).
  Verification was done by driving a headless Chromium (Playwright installed in the
  scratchpad) to screenshot phases at desktop + mobile, since there is no browser
  in the terminal. Reuse this pattern.
- Deployed to main after: build passes, no secrets tracked (.env gitignored),
  package-lock.json synced (it had gone stale after the TinaCMS commit and would
  break a clean install).

## Active work (July 18, 2026)

### Backend / Admin system IN PROGRESS
**Phase 0 DONE (deployed to main, July 18)**: Private login + dashboard shell.
- `lib/dashboard-auth.ts`: dependency-free session. One shared password (env
  DASHBOARD_PASSWORD), HMAC-signed httpOnly cookie (env DASHBOARD_SESSION_SECRET),
  7-day expiry, constant-time compares. Swap for an auth library when the studio
  needs per-person accounts.
- `app/(dash)/` route group: public /login and password-gated /dashboard subtree.
  Login form uses useActionState + server action. Dashboard shows Overview (roadmap
  of what is live, what is coming next) and tabs (Leads, Chats, Traffic, Tasks) with
  live items active and future items marked "soon". Links out to /admin (Tina).
- `proxy.ts`: exclude /dashboard and /login from next-intl locale rewrite (like
  /admin).
- **Verified:** guest -> 307 to /login; valid signed cookie -> 200 Overview;
  tampered cookie -> rejected. Production build passes.
- **Vercel setup:** Two env vars required in Project Settings:
  `DASHBOARD_PASSWORD` (the shared password) and `DASHBOARD_SESSION_SECRET`
  (a random base64 signing key). These are already set on live production.
- **URL:** https://yoursite.com/dashboard (once Vercel deploys).

**Phase 1 CODE DONE (July 18, awaiting DB provisioning):** Leads database +
contact form integration. All code is written, built, and committed on
design/botanical. The ONLY thing left is the owner creating the database.
- Driver: @neondatabase/serverless (Vercel Postgres is Neon-backed; HTTP driver
  is serverless-safe, unlike a raw pg TCP client). Reads DATABASE_URL (or
  POSTGRES_URL). Everything is resilient to a missing connection string: the
  site builds and the Leads page shows a "connect a database" note until it exists.
- lib/leads.ts: the DAL, the only file that talks to the leads DB. Lazily runs
  CREATE TABLE IF NOT EXISTS on first use (no migration step). validateLead()
  trims + caps + checks email. listLeads() calls requireAuth() first (read path
  is password-gated); insertLead() is the public write path. `import "server-only"`;
  the client table imports only the Lead TYPE (`import type`) so the DAL never
  enters the browser bundle.
- app/api/leads/route.ts: public POST. Honeypot (_gotcha) -> fake 200, no write.
  Then leadsLimiter (5 / 10 min per IP, own Upstash prefix), validate, then TWO
  independent sinks: insertLead (DB) AND forwardToFormspree (email). Succeeds if
  either works, 502 only if both fail. Accepts FormData or JSON.
- ContactForm.tsx now posts to /api/leads (was Formspree directly). Formspree KEPT
  as the email-notification path (dad keeps his emails), just moved server-side.
- app/(dash)/dashboard/leads/{page.tsx,LeadsTable.tsx}: server page + client search
  table (filter by name/email, newest first, no boxes). Leads flipped to live in
  the dashboard nav + Overview roadmap.
- Verified: production build passes; locally (no DB) guest->307 /login, honeypot->
  200 no-write, bad email/empty name->400. Did NOT fire a real submission (it would
  email dad via Formspree). Full end-to-end is the owner's job once the DB exists.
- OWNER STEP: Vercel dashboard -> project -> Storage -> Create Database -> Postgres
  (free). Connect to project, redeploy. DATABASE_URL is injected automatically.
- Phase 2 candidates: Chats tab (read visitor conversations), then Traffic, Tasks.

### Second website (kaolin-classic) TASK 3 DONE (July 18)
A separate Next.js 16 repo (Danila1801/kaolin_classic) built by a fresh Claude.
Tasks 1, 2, 3 complete and live at https://kaolin-classic.vercel.app.

**Task 1 DONE:** Scaffold + shell. Header (wordmark, nav, language switcher), footer,
all four locales, emerald/cream palette, Bricolage/Montserrat fonts.

**Task 2 DONE:** Full one-page site. All sections (hero, trust, services, work, process,
team, pricing, contact) using copy reused verbatim from the botanical site's
messages/*.json. Pricing: free-call framing, zero numbers. Contact form posts to
the owner's Formspree inbox (https://formspree.io/f/mrenzedl).

**Task 3 DONE:** Polish and launch. Lighthouse 95+ (mobile EN 98, RU 96, all locales
pass). WCAG AA (Accessibility 100). SEO 100 (robots, sitemap with hreflang, OG
image per locale, JSON-LD). Localized 404 page. No boxes, no em dashes, no slop.

**Task 4 IN PROGRESS:** Legal pages + Formspree test. A fresh Claude is adding
privacy/terms/cookies pages (trimmed from the botanical site to exclude chat/Groq
features), wiring footer links, testing the contact form end-to-end, and re-running
Lighthouse. Once done, the site is ready for the owner to point kaolin18.vercel.app
to this repo in the Vercel dashboard.

---

## Backend admin mode (July 18, 2026)

You own the backend/dashboard track. The second website is a separate repo, so the
two tracks never collide. Your focus: Phase 1 (Leads database integration). Here is
what you need to know.

### Current state
- Phase 0 (login + dashboard shell) is deployed to main.
- Two env vars are set on Vercel: DASHBOARD_PASSWORD and DASHBOARD_SESSION_SECRET.
- Dad can log in at https://yoursite.com/dashboard and sees an Overview roadmap.
- Contact form messages are currently sent to Formspree and disappear from our view.

### What Phase 1 needs
1. **Database:** Create a free Postgres in the Vercel dashboard (Vercel Postgres).
   This is the owner's step, not code, but flag it when you need the connection
   string.
2. **API route:** An endpoint that the contact form can POST to, which saves the
   message to the database and returns success/error. Endpoint can be
   app/api/leads or app/api/contact, your choice.
3. **Leads table:** A React component showing all messages (name, email, message,
   created_at) sorted newest first, searchable by name/email. Shows in
   /dashboard/leads (future tab that is currently marked "soon").
4. **Form switch:** Redirect the contact form (app/api/chat/route.ts or
   components/sections/ContactForm.tsx) to post to your new API endpoint instead
   of (or in addition to) Formspree.

### Approach
- Use a simple schema: leads table with (id, name, email, message, created_at).
- Wrap the table queries in a DAL (data access layer) that checks the dashboard
   session (use requireAuth from lib/dashboard-auth.ts).
- Formspree can stay or go; your choice. If you keep it, the form POSTs to both
   (database + Formspree). If you drop it, the form only POSTs to your API.
- The Leads page should live at app/(dash)/dashboard/leads/page.tsx so it is
   behind the password gate and uses the dashboard layout.

### Quality bar
Production build must pass, no console errors, /dashboard/leads must render with a
real list of messages (test with a form submission or a manual database insert), and
the Lighthouse score on /dashboard must stay >=95 (it is already 95 because the page
is simple, so this should be easy). All four locales of the public site must still
work perfectly (the dashboard is not localized; it is English-only for the admin).

---

## Next.js agent rules
@AGENTS.md
