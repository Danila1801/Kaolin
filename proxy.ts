import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next.js 16 renamed middleware.ts to proxy.ts — same contract.
// Redirects / to /en (or the visitor's Accept-Language match) and
// keeps every page request inside a locale prefix.
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals, Vercel internals, static files, and the
  // locale-less admin paths: TinaCMS (/admin), the private dashboard, and its
  // login page. These must not be rewritten into a /[locale]/ prefix.
  matcher: "/((?!api|trpc|_next|_vercel|admin|dashboard|login|.*\\..*).*)",
};
