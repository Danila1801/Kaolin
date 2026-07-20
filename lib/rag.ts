// Retrieval for the live chat assistant.
//
// This queries the SAME `doc_chunks` table that kaolin-rag (a separate repo,
// https://github.com/Danila1801/kaolin-rag) ingests into, in the same Neon
// database. Ingestion, chunking, and the measured relevance threshold all live
// there; this file only reads. No HTTP call to the other project: same DB,
// direct query, one less network hop and one less point of failure.
//
// Settings mirror kaolin-rag's measured config (maxDistance 0.68, the midpoint
// of a measured gap between in-corpus and off-topic cosine distance; see that
// repo's README for how it was derived). topK and candidates are trimmed
// smaller here on purpose: this is a live conversational widget, not a
// document-QA tool, so the grounding block should stay short enough that it
// doesn't dominate the system prompt or add noticeable latency.
//
// Fully optional by design: if DATABASE_URL or NVIDIA_API_KEY is missing, or
// the embedding call fails or is slow, this returns an empty array and the
// chat route falls back to exactly its old prompt-only behavior. A visitor
// saying "hi" should never be blocked on a vector search.

import "server-only";
import { neon } from "@neondatabase/serverless";

const NIM_BASE_URL = "https://integrate.api.nvidia.com/v1";
const EMBED_MODEL = "nvidia/nv-embedqa-e5-v5";
const EMBED_TIMEOUT_MS = 2500; // a slow NVIDIA call must never block the chat

const CANDIDATES = 40;
const TOP_K = 4;
const MAX_DISTANCE = 0.68; // measured in kaolin-rag; re-check there if the corpus changes

export type GroundingChunk = {
  source: string;
  heading: string | null;
  content: string;
  distance: number;
};

let _sql: ReturnType<typeof neon> | null = null;
function sql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) return null;
    _sql = neon(url);
  }
  return _sql;
}

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i]! * b[i]!;
  return s;
}
function cosine(a: number[], b: number[]): number {
  const d = Math.sqrt(dot(a, a)) * Math.sqrt(dot(b, b));
  return d === 0 ? 0 : dot(a, b) / d;
}

async function embedQuery(text: string): Promise<number[] | null> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EMBED_TIMEOUT_MS);
  try {
    const res = await fetch(`${NIM_BASE_URL}/embeddings`, {
      method: "POST",
      signal: controller.signal,
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        input: [text],
        model: EMBED_MODEL,
        input_type: "query", // asymmetric model: ingested text used "passage"
        encoding_format: "float",
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { embedding: number[] }[] };
    return json.data?.[0]?.embedding ?? null;
  } catch {
    // Timeout, network error, or malformed response: no grounding this turn,
    // not a broken chat.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Retrieve grounding chunks for the visitor's latest message.
 * Never throws. Returns [] whenever grounding isn't available or nothing is
 * relevant enough, which the caller treats as "answer from the prompt alone".
 */
export async function retrieveGrounding(question: string): Promise<GroundingChunk[]> {
  const db = sql();
  if (!db || !question.trim()) return [];

  const qVec = await embedQuery(question);
  if (!qVec) return [];

  let pool: (GroundingChunk & { id: number; embedding: string })[];
  try {
    const lit = `[${qVec.join(",")}]`;
    pool = (await db`
      SELECT id, source, heading, content, embedding::text AS embedding,
             embedding <=> ${lit}::vector AS distance
      FROM doc_chunks
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> ${lit}::vector
      LIMIT ${CANDIDATES}
    `) as (GroundingChunk & { id: number; embedding: string })[];
  } catch (err) {
    console.error("[rag] retrieval query failed:", err);
    return [];
  }

  const filtered = pool.filter((c) => c.distance <= MAX_DISTANCE);
  if (filtered.length === 0) return [];
  if (filtered.length <= TOP_K) return filtered;

  // MMR: pick each next chunk by relevance minus redundancy with what's
  // already selected, so a handful of near-duplicate project READMEs (several
  // repos all describe "a Next.js site with four locales") don't crowd out
  // everything else. Same algorithm as kaolin-rag's retrieve.ts, ported here
  // rather than imported since this is a separate deployable project.
  const vecs = new Map(filtered.map((c) => [c.id, c.embedding.slice(1, -1).split(",").map(Number)]));
  const relevance = new Map(filtered.map((c) => [c.id, 1 - c.distance]));
  const selected: typeof filtered = [];
  const remaining = [...filtered];
  const MMR_LAMBDA = 0.7;

  while (selected.length < TOP_K && remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const cand = remaining[i]!;
      const rel = relevance.get(cand.id) ?? 0;
      const cv = vecs.get(cand.id)!;
      let maxSim = 0;
      for (const s of selected) {
        maxSim = Math.max(maxSim, cosine(cv, vecs.get(s.id)!));
      }
      const score = MMR_LAMBDA * rel - (1 - MMR_LAMBDA) * maxSim;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }
    selected.push(remaining.splice(bestIdx, 1)[0]!);
  }
  return selected;
}

/** Render chunks as a compact block for the system prompt. */
export function formatGrounding(chunks: GroundingChunk[]): string {
  if (chunks.length === 0) return "";
  return chunks
    .map((c) => `(${c.source} > ${c.heading ?? "untitled"})\n${c.content}`)
    .join("\n\n");
}
