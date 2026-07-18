// Dashboard login — the lock on /dashboard.
//
// This is a deliberately small, dependency-free session system for a private
// admin used by two trusted people. It is NOT a full user system:
//  - There is ONE shared password (env DASHBOARD_PASSWORD).
//  - A successful login sets a signed, httpOnly cookie that says "this browser
//    is allowed, until <expiry>". Nothing else is stored.
//  - The cookie is signed with an HMAC (env DASHBOARD_SESSION_SECRET) so a
//    visitor cannot forge or tamper with it. It carries no personal data.
//
// When the studio grows and needs real per-person accounts, swap this file for
// an auth library (see node_modules/next/dist/docs/.../authentication.md).

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "kaolin_dash";
const MAX_AGE_S = 60 * 60 * 24 * 7; // stay signed in for 7 days

function secret(): string {
  const s = process.env.DASHBOARD_SESSION_SECRET;
  if (!s) throw new Error("DASHBOARD_SESSION_SECRET is not set");
  return s;
}

// Sign an arbitrary string with the secret. Returns a url-safe signature.
function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

// A token is "<expiryMillis>.<signature>". The signature covers the expiry, so
// the expiry cannot be extended without knowing the secret.
function makeToken(): string {
  const exp = String(Date.now() + MAX_AGE_S * 1000);
  return `${exp}.${sign(exp)}`;
}

function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);

  // Constant-time compare of the signature (both are equal-length hex/base64url).
  const got = Buffer.from(sig);
  const want = Buffer.from(sign(exp));
  if (got.length !== want.length || !timingSafeEqual(got, want)) return false;

  const expMs = Number(exp);
  return Number.isFinite(expMs) && Date.now() <= expMs;
}

// Compare the typed password to the configured one without leaking its length
// or timing: hash both to a fixed 32 bytes first, then constant-time compare.
export function checkPassword(input: string): boolean {
  const expected = process.env.DASHBOARD_PASSWORD;
  if (!expected) return false;
  const a = createHmac("sha256", secret()).update(input).digest();
  const b = createHmac("sha256", secret()).update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function startSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, makeToken(), {
    httpOnly: true, // JS on the page can never read it
    secure: process.env.NODE_ENV === "production", // https only in production
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  return isValidToken(store.get(COOKIE)?.value);
}

// Use at the top of any protected page/action. Sends guests to the login page.
export async function requireAuth(): Promise<void> {
  if (!(await isAuthed())) redirect("/login");
}
