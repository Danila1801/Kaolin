/**
 * Contact form endpoint — where a visitor's message lands.
 *
 * One POST from the form fans out to two independent places:
 *   1. our own Postgres (so the dashboard can list and search leads);
 *   2. Formspree (so dad keeps getting the email notification he already relies on).
 *
 * They are treated as independent on purpose: if the database is down or not yet
 * configured, the email still goes out; if Formspree hiccups, the row is still
 * saved. We only report failure to the visitor when BOTH sinks failed.
 *
 * This route is public and unauthenticated (anyone can submit the form), so it
 * is guarded by a honeypot + an IP rate limit before it writes anything.
 */

import { insertLead, validateLead } from "@/lib/leads";
import { leadsLimiter, rateLimitConfigured } from "@/lib/ratelimit";

// insertLead uses the Neon driver + our server-only DAL — pin to Node, never Edge.
export const runtime = "nodejs";

// Same inbox the form used before we owned a database. Kept so the notification
// email keeps working. This key is public by design (it can only receive).
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mrenzedl";

function getClientId(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "anonymous";
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Accept either a form POST (FormData) or JSON, so the client can send whichever
// is simplest. Returns a plain record of string fields.
async function readFields(req: Request): Promise<Record<string, string>> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("application/json")) {
    const body = (await req.json()) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(body)) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  }
  const form = await req.formData();
  const out: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

// Best-effort forward to Formspree for the email notification. Never throws.
async function forwardToFormspree(lead: {
  name: string;
  email: string;
  message: string;
}): Promise<boolean> {
  try {
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: lead.name,
        email: lead.email,
        message: lead.message,
        _subject: "New message from kaolin.studio",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  let fields: Record<string, string>;
  try {
    fields = await readFields(req);
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  // Honeypot: a hidden field only a bot would fill. Pretend success so the bot
  // learns nothing, but save nothing.
  if (fields._gotcha) return json({ ok: true }, 200);

  // Rate limit before any write. Falls open if Upstash isn't configured (local
  // dev), which matches how the chat route behaves.
  if (rateLimitConfigured && leadsLimiter) {
    const { success, reset } = await leadsLimiter.limit(getClientId(req));
    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      return new Response(JSON.stringify({ error: "rate_limited", retryAfter }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) },
      });
    }
  }

  const valid = validateLead(fields);
  if (!valid.ok) return json({ error: "invalid", field: valid.error }, 400);
  const lead = valid.value;

  // Two independent sinks. Try both; succeed if either works.
  let saved = false;
  try {
    await insertLead(lead);
    saved = true;
  } catch (err) {
    // Not configured yet, or a transient DB error. Log and lean on the email.
    console.error("[leads] database insert failed:", err);
  }

  const emailed = await forwardToFormspree(lead);

  if (!saved && !emailed) {
    return json({ error: "upstream" }, 502);
  }
  return json({ ok: true }, 200);
}
