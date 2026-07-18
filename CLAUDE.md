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

## Next big tasks (owner's direction, do these next)
1. Backend / admin system: a whole system for the dad to MONITOR the website and
   COORDINATE the project around it (project management + site monitoring). Note:
   the repo already has TinaCMS (commit d5b81c0) and a Payload CMS blueprint exists
   in the strategy doc; reconcile before adding a second backend. Confirm scope with
   the owner (what to monitor, who logs in, what "coordinate the project" means).
2. A SECOND, "regular" website: a summarized, non-3D alternative to show clients as
   an option. Same text and same colors/brand as the botanical site, but a normal
   clean website (no cats, no WebGL field, no orange). It should also be a full redo
   of the old ugly kaolin18.vercel.app. Build it fresh, reuse the copy + palette
   tokens. The botanical (3D) site stays as the creative flagship; this is the safe,
   summarized alternative.

## Next.js agent rules
@AGENTS.md
