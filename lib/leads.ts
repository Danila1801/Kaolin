// Leads data-access layer — the ONLY place that talks to the leads database.
//
// Why a single file: the public contact form (a write) and the private
// dashboard (a read) both need the leads table, but they have very different
// trust levels. Keeping every query here means the rules live in one place:
//  - the READ path (listLeads) demands the dashboard password first;
//  - the WRITE path (insertLead) is public but validated and length-capped.
//
// The database is Vercel Postgres (Neon under the hood). We talk to it with
// Neon's HTTP driver, which is safe on Vercel's serverless functions — a normal
// TCP client (`pg`) would leak connections there. Vercel injects the connection
// string as an env var when you create the database; until then this file is
// "not configured" and callers show a friendly setup note instead of crashing.

import "server-only";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/dashboard-auth";

export type Lead = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string; // ISO timestamp
};

export type NewLead = {
  name: string;
  email: string;
  message: string;
};

// Vercel Postgres / Neon exposes several env vars; DATABASE_URL and POSTGRES_URL
// are the two common names. We accept either so the owner doesn't have to rename.
function connectionString(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

// True once the owner has created the database and its URL is available. The
// dashboard uses this to decide between "show the leads" and "show setup steps".
export const leadsConfigured = Boolean(connectionString());

// Build the SQL client lazily and once. Returns null when unconfigured so no
// import-time crash can happen during a build with no database attached.
let _sql: ReturnType<typeof neon> | null = null;
function getSql() {
  if (_sql) return _sql;
  const url = connectionString();
  if (!url) return null;
  _sql = neon(url);
  return _sql;
}

// Create the table on first use so there is no separate migration step to run.
// Memoized: the CREATE runs at most once per warm server instance.
let _ready: Promise<void> | null = null;
function ensureTable(sql: NonNullable<ReturnType<typeof getSql>>): Promise<void> {
  if (_ready) return _ready;
  _ready = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS leads (
        id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name       TEXT NOT NULL,
        email      TEXT NOT NULL,
        message    TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC)`;
  })();
  return _ready;
}

// Basic, boring validation. We are the last line before the database, so trim,
// cap lengths, and sanity-check the email shape. Returns a cleaned lead or an
// error string (never throws for bad input — bad input is expected here).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLead(input: {
  name?: unknown;
  email?: unknown;
  message?: unknown;
}): { ok: true; value: NewLead } | { ok: false; error: string } {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const message = typeof input.message === "string" ? input.message.trim() : "";

  if (name.length < 1 || name.length > 200) return { ok: false, error: "name" };
  if (email.length > 320 || !EMAIL_RE.test(email)) return { ok: false, error: "email" };
  if (message.length < 1 || message.length > 5000) return { ok: false, error: "message" };

  return { ok: true, value: { name, email, message } };
}

// WRITE — public. Assumes `input` is already validated (call validateLead first,
// or pass a NewLead). Saves the row and returns it. Throws only on a real
// database failure, which the API route turns into a 5xx.
export async function insertLead(input: NewLead): Promise<Lead> {
  const sql = getSql();
  if (!sql) throw new Error("leads database is not configured");
  await ensureTable(sql);

  const rows = (await sql`
    INSERT INTO leads (name, email, message)
    VALUES (${input.name}, ${input.email}, ${input.message})
    RETURNING id, name, email, message, created_at
  `) as Lead[];

  return rows[0]!;
}

// READ — private. Guarded by the dashboard password: a guest hitting the leads
// page is redirected to /login before any row is fetched. Newest first.
export async function listLeads(): Promise<Lead[]> {
  await requireAuth();
  const sql = getSql();
  if (!sql) return [];
  await ensureTable(sql);

  const rows = (await sql`
    SELECT id, name, email, message, created_at
    FROM leads
    ORDER BY created_at DESC
    LIMIT 1000
  `) as Lead[];

  return rows;
}
