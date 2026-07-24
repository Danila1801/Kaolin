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

### GitHub portfolio track (July 20, 2026) DONE
The owner is applying for applied-AI / LLM-engineer internships in the
Netherlands/EU. The whole public GitHub was cleaned up and positioned as
"applied AI engineer who ships production apps", NOT an ML researcher.
- DELETED by the owner: Conversational-Agent-Cookpanion (contained only a
  README, zero code) and Text-Mining-for-Ai (study material only). Do not
  reference them again.
- 7 public repos remain: Kaolin, kaolin_classic, Nook, PortativSRL, yt_to_md,
  kaolin-demo-clinic, OblastZero. Every one got a rewritten README with a fixed
  structure (one-line description, what it is/why, verified tech stack, key
  features, status, live link, how to run), plus a GitHub description, homepage,
  and topics set via the REST API.
- Profile README created at Danila1801/Danila1801. Bio and website replaced.
- HARD RULE, carried from this work: never claim a capability the code does not
  contain. Specifically, the Kaolin assistant is Groq `llama-3.3-70b-versatile`
  with a hand-written system prompt. It is NOT Claude and it is NOT RAG (no
  embeddings, no vector store, no retrieval anywhere in the repo). READMEs say
  so accurately. If RAG is ever wanted on the CV, it has to be built first.
- Encoding gotcha: kaolin_classic/README.md and yt_to_md/README.md were UTF-16
  and rendered as garbage on GitHub. Both rewritten as UTF-8. Watch for this
  when a Windows tool writes a file.
- Nook localisation is EN + RU only; `nl.js` and `ro.js` are empty objects that
  fall back to English. Do not describe Nook as a four-language app.
- Tooling note: `gh` is NOT installed on this machine. Git pushes work through
  Git Credential Manager. For GitHub API work, the token can be read with
  `printf 'protocol=https\nhost=github.com\n\n' | git credential fill` (the
  trailing BLANK LINE is required or it hangs). That token has repo + user
  scope but NOT delete_repo.

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

**Task 4 DONE (verified July 20):** Legal pages landed. `app/[locale]/privacy`,
`/terms`, `/cookies` exist with footer links, trimmed to exclude chat/Groq
features. Two perf commits followed (dropped the Bricolage opsz axis and stopped
preloading the body font, both to shrink LCP). Site is live at
https://kaolin-classic.vercel.app.
OPEN DECISION: which build owns kaolin18.vercel.app. Right now the BOTANICAL
site serves it; kaolin_classic's old README claimed it would replace it. Pick one
and redirect the other.

---

## THE PLAN (July 20, 2026): two parallel tracks

Goal for this summer: keep Kaolin shipping AND produce the portfolio that lands
an applied-AI / LLM-engineer internship in NL. Two Claude sessions run in
parallel. The contract that keeps them safe is DISJOINT FILE OWNERSHIP.

| | Track A (Opus, backend/LLM) | Track B (Sonnet, surface/content) |
|---|---|---|
| Owns in Kaolin | `lib/`, `app/api/`, `app/(dash)/` | `messages/`, `components/sections/`, `app/[locale]/`, `app/globals.css` |
| Owns elsewhere | new `kaolin-rag` repo | Nook, PortativSRL, kaolin_classic |

Neither track edits the other's paths. If a change is needed across the line,
it goes through the owner, not a direct edit.

### Decisions locked (July 20)
- RAG corpus: **Kaolin's own studio docs** (READMEs, service/pricing copy, CLAUDE.md).
- RAG home: **standalone repo `kaolin-rag` first**, then wire Kaolin's live
  assistant to it. Standalone = the recruiter-visible artifact; wiring it in =
  the "it runs in production" proof.
- Embeddings: **NVIDIA NIM**, OpenAI-compatible at
  `https://integrate.api.nvidia.com/v1`. Model `nvidia/nv-embedqa-e5-v5`,
  verified **1024 dimensions**. These are ASYMMETRIC: pass
  `input_type: "passage"` when ingesting and `"query"` when searching. Getting
  that backwards silently degrades retrieval.
- No rerankers exposed on that endpoint, so retrieval = vector search + MMR
  diversification, not a cross-encoder.
- Vector store: **pgvector in the same Neon Postgres** as leads. One free DB.
- SECURITY: the NVIDIA key was pasted into a chat and is therefore burned.
  It must be ROTATED. Never commit it; it lives only in gitignored `.env.local`
  as `NVIDIA_API_KEY`.

### Track A progress (July 20, updated end of day)
A1 DONE AND VERIFIED LIVE ON PRODUCTION. /dashboard and /dashboard/leads 307 to
/login, /api/leads honeypot returns 200 with no write, bad email returns 400,
all four locales 200. Neon Postgres confirmed wired in production (the owner
saw the manually-inserted "TEST ROW (safe to delete)" render at
/dashboard/leads, since deleted). pgvector 0.8.0 enabled, `doc_chunks` table
live with vector(1024).

A2 + A3 DONE. `kaolin-rag` is a separate public repo:
github.com/Danila1801/kaolin-rag, local clone at
C:\Users\danil\projects\kaolin-rag. 74 chunks from 7 studio documents.
**Live demo: kaolin-rag.vercel.app** (needs DATABASE_URL, NVIDIA_API_KEY, and
critically GROQ_API_KEY set in ITS OWN Vercel project, separate from Kaolin's).
Verified end-to-end in production: grounded answers with citations (~1-4s with
Groq), off-topic questions refused (~0.9s, skips generation entirely), the
pricing trap answered without inventing a euro figure, malformed input 400s,
rate limiting 429s correctly.

Measured eval (npm run eval, 18 golden cases): retrieval hit@5 100%, MRR 0.964,
routing accuracy 100%, grounding 94%, faithfulness 93%. Numbers and the full
golden set are committed in the repo.

Three real bugs found and fixed, all worth remembering:
 1. nv-embedqa-e5-v5 REJECTS input over 512 tokens (400, not truncation). A
    chars/4 token estimate underestimated dense Markdown by ~1.8x. Estimator is
    now chars/3 plus a hard character ceiling and a recursive splitter.
 2. The refusal threshold was guessed at 0.62 and caused FALSE REFUSALS. It is
    now MEASURED: in-corpus queries score 0.444-0.624 cosine distance, off-topic
    0.738-0.824. 0.68 is the midpoint of that empty band. Re-measure if the
    corpus changes materially.
 3. The hosted demo 504-timed-out (FUNCTION_INVOCATION_TIMEOUT at 60s) on real
    questions because generation defaulted to NVIDIA's free tier (15-50s per
    answer). Fixed by adding a provider-fallback in src/llm.ts: Groq when
    GROQ_API_KEY is set (2-4s), NVIDIA otherwise. Both projects (Kaolin's site
    AND kaolin-rag) need GROQ_API_KEY set separately on Vercel; they are
    different projects with different env vars even though they share one DB.

TRIED AND REJECTED: HyDE (src/hyde.ts in kaolin-rag). Embedding a hypothetical
answer and fusing it with the question via Reciprocal Rank Fusion moved one
target chunk from rank 22 to rank 10 of 74, still outside topK=5, so it did not
even fix the case it targeted. Worse, run across the full eval it dropped
routing accuracy from 100% to 89%: two previously-refused off-topic questions
started getting answered, because even an unrelated question's invented
passage embeds close to SOMETHING in a small corpus, and fusion widened the
candidate pool exactly where refusal needed it narrowest. Shipped disabled
(config.hyde.enabled = false) and documented as a negative result in the
kaolin-rag README. This is the intended output of having a real eval harness:
it caught a regression a single hand-checked example would have missed.

A4.2 DONE AND VERIFIED LIVE. Dashboard Chats tab: lib/chats.ts (one row per
conversation, JSONB message array grown by concatenation, keyed by a
client-generated id from ChatWidget.tsx), app/(dash)/dashboard/chats/. Flipped
live in nav + Overview.
REAL BUG CAUGHT BY DIRECT DB VERIFICATION, not by the build or a local test:
the first version awaited the DB write AFTER controller.close() inside the
stream's finally block, assuming that kept the function invocation alive. It
does not on Vercel: once the response stream reaches EOF the platform can
freeze the invocation immediately, and a bare await after that point has no
completion guarantee. Local testing never caught this because it called the
DAL through plain Node, never exercising Vercel's freeze behavior. Caught by
sending a real message to production then querying the chats table directly
with DATABASE_URL (the dashboard's own read path couldn't be used to verify,
since curl cannot forge the Next-Action header its server-action login needs).
FIXED with next/server's `after()`, the documented API for "run this after the
response, but guarantee the platform keeps the invocation alive for it".
Confirmed the export existed in this Next 16.2.10 install before using it, not
assumed. Re-verified end to end after the fix: row lands correctly.
LESSON: "it works in a local script" and "it works on Vercel's serverless
runtime" are different claims. Anything scheduled after a response is sent
needs after() (or must be awaited before the response, trading latency for
certainty), never a bare unawaited-by-the-platform promise.

A4.1 DONE. The site's live chat (app/api/chat/route.ts) now grounds itself in
kaolin-rag's document store. lib/rag.ts queries the SAME doc_chunks table
directly (same Neon DB as kaolin-rag, no HTTP hop between projects), embeds the
visitor's LAST message via NVIDIA (2.5s timeout, fails to [] not an error),
and MMR-diversifies to top 4. Grounding is appended to the system prompt as
reference material in the assistant's own conversational voice (no citation
brackets, this is a chat widget not a QA tool) only when something clears the
same measured 0.68 threshold; a bare "hi there!" correctly retrieves 0 chunks
and costs nothing extra. Fully backward compatible: if NVIDIA_API_KEY or
DATABASE_URL is absent, retrieval no-ops and the endpoint behaves exactly as
before.
DECISION (July 21): the owner chose NOT to add NVIDIA_API_KEY to Kaolin's own
Vercel project. Grounding stays permanently off on the live site; the chat
keeps running prompt-only, exactly as it did before A4.1. This is a deliberate
scope cut, not a bug or an oversight, do not re-raise it as a pending task.
Confirmed safe to skip: retrieval no-ops cleanly without the key (tested live
July 21 by asking "how many guided rituals does Nook have" and getting an
honest "I don't know", not a crash or a wrong answer), so nothing breaks by
leaving this unset indefinitely. NVIDIA_API_KEY remains set on kaolin-rag's
OWN separate Vercel project, where it powers the standalone demo and is
unaffected by this decision.

### Track A backlog (10 tasks, 4 batches)
A1 ship what exists: (1) reconcile `design/botanical` with `origin/main` and
merge Phase 1 to main, (2) verify leads on production, (3) DB provisioning steps
+ Vercel health check.
A2 RAG core: (4) scaffold `kaolin-rag`, (5) ingestion + structure-aware chunking
of studio docs, (6) NIM embeddings + pgvector store.
A3 what makes it senior, not a tutorial: (7) retrieval + MMR + answers WITH
citations, (8) eval harness (golden Q/A set, hit-rate@k, faithfulness, results
committed to the README), (9) guardrails: refuse on low retrieval confidence,
rate limit, per-request token/cost telemetry.
A4 land it: (10) wire Kaolin's assistant to the RAG path, then the Chats tab in
the dashboard and the RAG README/architecture diagram.

### Track B backlog (10 tasks, 4 batches)
B1 credibility (do first, cheapest internship wins): (1) PortativSRL
`lib/company.ts` hardcodes `ratingValue: "4.6"` and `reviewCount: "9"` into
JSON-LD. Verify those are real reviews or DELETE them; fake review markup is a
Google penalty and an interview liability. (2) Nook `src/lib/i18n/nl.js` and
`ro.js` are empty objects silently falling back to English: translate them, then
drop the EN+RU caveat from its README. (3) Make OblastZero private or delete it
(it is a bare Unity template, zero gameplay code).
B2 depth: (4) case-study section for Kaolin/Nook/Portativ (problem, approach,
result, honest), (5) cross-locale QA (RU Cyrillic, RO diacritics, no em dashes,
no mobile overflow), (6) Lighthouse + WCAG AA re-audit on all four locales.
B3 unify: (7) point kaolin_classic's contact form at its own `/api/leads` so
leads stop scattering across Formspree inboxes, (8) settle which build owns
kaolin18.vercel.app and redirect the other, (9) OG/social preview pass on both
sites + the demo clinic.
B4 story: (10) align GitHub profile, CV and LinkedIn into one narrative; add
language proficiency levels, internship availability window, and a direct
contact route to the profile README.

## Backend admin mode (updated July 20, 2026)

You own the backend/dashboard/LLM track.

### Current state
- Phase 0 (login + dashboard shell) is deployed and live.
- Env vars set on Vercel: DASHBOARD_PASSWORD and DASHBOARD_SESSION_SECRET.
- Dad can log in at https://kaolin18.vercel.app/dashboard and sees the Overview.
- **Phase 1 (leads DB) is WRITTEN BUT NOT SHIPPED.** Commit 53cc883 sits on the
  local `design/botanical` branch, unpushed. `origin/main` meanwhile has the
  README rewrite (845b276) that `design/botanical` does not have, so the two have
  diverged and must be reconciled before merging. Until that merge lands, the
  live contact form still posts to Formspree only.

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
