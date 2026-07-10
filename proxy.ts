import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed middleware.ts to proxy.ts — same contract.
// Redirects / to /en (or the visitor's Accept-Language match) and
// keeps every page request inside a locale prefix.
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, Vercel internals, and static files.
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
