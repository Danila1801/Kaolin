import { notFound } from "next/navigation";

// Catch-all for any unmatched path inside a locale (e.g. /en/does-not-exist).
// Without this, Next falls through to its own un-localized default 404; calling
// notFound() here routes the request to app/[locale]/not-found.tsx instead, so
// the 404 keeps the site's chrome and language. (This is the documented
// next-intl pattern for localized not-found pages.)
export default function CatchAllNotFound() {
  notFound();
}
