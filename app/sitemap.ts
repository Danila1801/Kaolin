import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL, localeAlternates } from "@/lib/site";

// Every indexable path, once per locale, each entry carrying its hreflang
// alternates so search engines can group the four language versions together.
const PATHS = ["", "/privacy", "/terms", "/cookies"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? ("monthly" as const) : ("yearly" as const),
      priority: path === "" ? 1 : 0.3,
      // Reuse the shared hreflang helper so the sitemap and the per-page
      // metadata alternates stay identical — including the x-default entry.
      alternates: { languages: localeAlternates(path) },
    })),
  );
}
