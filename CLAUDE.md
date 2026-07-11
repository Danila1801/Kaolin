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

## Design system
Fonts: headings Fraunces (variable serif), body DM Sans; mono JetBrains Mono for
AI/code accents. Fraunces and DM Sans have no Cyrillic — PT Serif / PT Sans are
chained as fallbacks for /ru (already wired in globals.css + app/[locale]/layout.tsx).
Palette: bg #F5E9D6, ink #2B211A, accent rust #a84c1a, muted #71614f, card #FBF4E8.
(Rust and muted were nudged slightly darker on Day 7 — from #B4531F / #7A6A58 —
so text using them clears WCAG AA 4.5:1 on cream; use these AA-passing values.)
Type scale (1.25): 16/20/25/31/39/49/61; body 18px/1.6; headline tracking -0.02em at
40px+. Spacing (4px base): 4/8/12/16/24/32/48/64/96/128; sections 96-128px desktop.
Motion: 300-600ms ease-out reveals, once only, respect prefers-reduced-motion.
All of this is encoded as Tailwind tokens in app/globals.css — use those, don't
hardcode values.

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

## Next.js agent rules
@AGENTS.md
