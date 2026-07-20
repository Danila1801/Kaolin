# Kaolin

A four-language marketing site with a live WebGL scene, an embedded AI assistant, and a private admin dashboard. Built and shipped to production.

**Live: [kaolin18.vercel.app](https://kaolin18.vercel.app)**

## What it is / why it exists

Kaolin is a small AI-implementation studio (Amsterdam and Chisinau). This is its
website, and it is deliberately built as the studio's own proof of capability:
instead of describing what we can build, the site *is* the demo. The visitor
meets a running WebGL scene, a working AI assistant, and behind a password, the
admin tooling that runs the business.

I built the front end, the scene, the assistant endpoint, and the dashboard.

There are two versions of this site, both shipped:

| Version | Repo | Live |
|---|---|---|
| **Botanical** (this repo), the flagship, with the WebGL field | `Kaolin` | [kaolin18.vercel.app](https://kaolin18.vercel.app) |
| **Classic**, a lighter non-3D build | [kaolin_classic](https://github.com/Danila1801/kaolin_classic) | [kaolin-classic.vercel.app](https://kaolin-classic.vercel.app) |

## Tech stack

- **Next.js 16** (App Router), **React 19**, **TypeScript**
- **Tailwind v4** (design tokens via `@theme` in `app/globals.css`)
- **next-intl v4**, four locales: `en` / `nl` / `ro` / `ru`
- **React Three Fiber + three.js**, custom GLSL (RawShaderMaterial)
- **Groq** (`llama-3.3-70b-versatile`) through the OpenAI-compatible SDK
- **Upstash Redis** for rate limiting
- **Postgres** (Neon serverless driver) for lead capture
- **TinaCMS** for content editing
- Deployed on **Vercel**

## Key features

**Living WebGL scene.** A botanical field renders behind the whole page. Scroll
position drives a continuous day to sunset to night to sunrise cycle. The sun and
moon are two independent bodies on analytic horizon-to-horizon arcs, with limb
darkening, a reddening low sun, procedural moon craters, and a dot-product phase
terminator that shifts crescent to gibbous. Grass is a single InstancedMesh. An
adaptive DPR ladder keeps it cheap on mobile, there is a WebGL2 capability probe
with a non-WebGL fallback, and all motion freezes under `prefers-reduced-motion`.

**Embedded AI assistant.** A streaming chat widget grounded in a hand-written
system prompt describing the studio, its services, and its pricing policy.
The engineering around it is the actual point:

- API key stays server-side, pinned to the Node runtime, never shipped to the browser
- Rate limited *before* any model call: Upstash sliding windows at 5/min and 50/day per IP, so one visitor cannot drain a shared free-tier quota
- Prompt-injection hardening in the system prompt, with visitor text treated as untrusted content
- History trimmed to the last 20 turns and capped per message to bound cost
- Replies streamed token by token

**Private admin dashboard.** Password-gated area at `/dashboard`:

- Dependency-free session: one shared password, HMAC-signed httpOnly cookie, constant-time comparison, 7-day expiry
- Leads view listing every contact form submission, searchable, newest first
- The contact form posts to an internal API that writes to Postgres *and* forwards to an email provider, treated as independent sinks so a submission is never lost if one fails
- Honeypot plus per-IP rate limiting on the public write path

**Production hygiene.** WCAG AA, four locales verified including Cyrillic and
Romanian diacritics, skip link, sitemap with `x-default` hreflang, per-locale
Open Graph images, no secrets in the client bundle.

## Status

**Shipped and live.** Actively maintained. The dashboard is being extended
(visitor chat history, traffic, and a shared task board are next).

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 and you will be redirected to a locale (`/en`, `/nl`,
`/ro`, `/ru`).

The site runs without any environment variables. Individual features degrade
gracefully when their keys are absent, so the build never breaks:

| Variable | Enables |
|---|---|
| `GROQ_API_KEY` | The AI assistant (returns a clear 503 without it) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Rate limiting (falls open locally, warns in production) |
| `DASHBOARD_PASSWORD` / `DASHBOARD_SESSION_SECRET` | The `/dashboard` login |
| `DATABASE_URL` | Saving leads to Postgres (falls back to email only) |

Copy lives in `messages/*.json`, design tokens in `app/globals.css`, and the
scene in `components/scene/`.
