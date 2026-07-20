// Chats data-access layer — the ONLY place that talks to the chats table.
//
// Same shape as lib/leads.ts: a public WRITE path (the chat route appends a
// turn after each exchange) and a password-gated READ path (the dashboard).
// Same database, same "not configured" degrade-gracefully behavior.
//
// One row per CONVERSATION, not per message. `messages` is a JSONB array that
// grows by concatenation (`chats.messages || EXCLUDED.messages`) on every
// turn, so a long back-and-forth is one row, not dozens.
//
// Token counts are ESTIMATES (see estimateTokens below), not exact billing
// figures, and there is deliberately no dollar-cost column. The live chat
// runs on Groq's free tier specifically because it carries zero billing risk
// (see app/api/chat/route.ts's own header comment) — inventing a precise cost
// figure for a free-tier deployment would be exactly the kind of fabricated
// number this project's copy rules forbid elsewhere. Token counts are still a
// useful signal: they show usage pattern and would matter the day the studio
// switches to a paid model.

import "server-only";
import { neon } from "@neondatabase/serverless";
import { requireAuth } from "@/lib/dashboard-auth";

export type ChatTurnMessage = { role: "user" | "assistant"; content: string; at: string };

export type Chat = {
  id: string;
  locale: string;
  messages: ChatTurnMessage[];
  turn_count: number;
  grounded_turns: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  created_at: string;
  updated_at: string;
};

export type NewTurn = {
  chatId: string;
  locale: string;
  userContent: string;
  assistantContent: string;
  grounded: boolean;
  promptTokens: number;
  completionTokens: number;
};

function connectionString(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

export const chatsConfigured = Boolean(connectionString());

let _sql: ReturnType<typeof neon> | null = null;
function getSql() {
  if (_sql) return _sql;
  const url = connectionString();
  if (!url) return null;
  _sql = neon(url);
  return _sql;
}

let _ready: Promise<void> | null = null;
function ensureTable(sql: NonNullable<ReturnType<typeof getSql>>): Promise<void> {
  if (_ready) return _ready;
  _ready = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS chats (
        id                 TEXT PRIMARY KEY,
        locale             TEXT NOT NULL,
        messages           JSONB NOT NULL DEFAULT '[]'::jsonb,
        turn_count         INT NOT NULL DEFAULT 0,
        grounded_turns     INT NOT NULL DEFAULT 0,
        prompt_tokens      INT NOT NULL DEFAULT 0,
        completion_tokens  INT NOT NULL DEFAULT 0,
        total_tokens       INT NOT NULL DEFAULT 0,
        created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS chats_updated_at_idx ON chats (updated_at DESC)`;
  })();
  return _ready;
}

// A conversational reply is prose, close enough to the ~4 chars/token rule
// that a naive estimate is fine here (unlike the dense Markdown chunks in
// kaolin-rag, which needed the more conservative chars/3). Approximate on
// purpose: this is a usage signal for a dashboard, not a billing system.
export function estimateTokens(text: string): number {
  return estimateTokensFromLength(text.length);
}

// Same estimate, taking a character COUNT directly. Lets a caller measure
// something (like a concatenated prompt) by summing lengths instead of
// building and holding onto one large string just to call estimateTokens.
export function estimateTokensFromLength(chars: number): number {
  return Math.ceil(chars / 4);
}

// WRITE — public, called by the chat route after a reply finishes streaming.
// Upserts: first turn creates the row, every later turn appends to it. Never
// throws to the caller in a way that should break the live chat; the route
// wraps this in its own try/catch regardless, but a DB error here is still
// surfaced so it gets logged.
export async function appendTurn(turn: NewTurn): Promise<void> {
  const sql = getSql();
  if (!sql) return; // not configured: telemetry is optional, the chat isn't
  await ensureTable(sql);

  const now = new Date().toISOString();
  const newMessages: ChatTurnMessage[] = [
    { role: "user", content: turn.userContent, at: now },
    { role: "assistant", content: turn.assistantContent, at: now },
  ];
  const total = turn.promptTokens + turn.completionTokens;

  await sql`
    INSERT INTO chats (id, locale, messages, turn_count, grounded_turns,
                        prompt_tokens, completion_tokens, total_tokens, updated_at)
    VALUES (${turn.chatId}, ${turn.locale}, ${JSON.stringify(newMessages)}::jsonb, 1,
            ${turn.grounded ? 1 : 0}, ${turn.promptTokens}, ${turn.completionTokens}, ${total}, now())
    ON CONFLICT (id) DO UPDATE SET
      messages          = chats.messages || EXCLUDED.messages,
      turn_count        = chats.turn_count + 1,
      grounded_turns    = chats.grounded_turns + EXCLUDED.grounded_turns,
      prompt_tokens     = chats.prompt_tokens + EXCLUDED.prompt_tokens,
      completion_tokens = chats.completion_tokens + EXCLUDED.completion_tokens,
      total_tokens      = chats.total_tokens + EXCLUDED.total_tokens,
      updated_at        = now()
  `;
}

// READ — private. requireAuth() first, same as listLeads().
export async function listChats(): Promise<Chat[]> {
  await requireAuth();
  const sql = getSql();
  if (!sql) return [];
  await ensureTable(sql);

  return (await sql`
    SELECT id, locale, messages, turn_count, grounded_turns,
           prompt_tokens, completion_tokens, total_tokens, created_at, updated_at
    FROM chats
    ORDER BY updated_at DESC
    LIMIT 500
  `) as Chat[];
}
