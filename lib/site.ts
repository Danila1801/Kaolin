import { routing } from "@/i18n/routing";

// Canonical production origin. The repo auto-deploys to kaolin18.vercel.app
// (the one project that matters). Swap this single constant if a custom domain
// is added later — every metadata helper, the sitemap, and robots read from it.
export const SITE_URL = "https://kaolin18.vercel.app";

// Open Graph locale codes for our four next-intl locales.
export const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  nl: "nl_NL",
  ro: "ro_RO",
  ru: "ru_RU",
};

// hreflang alternates map for a given path ("" = home, "/privacy", …).
// Includes an x-default pointing at the default locale so crawlers that don't
// match any hreflang still have a canonical fallback.
export function localeAlternates(path = ""): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${SITE_URL}/${locale}${path}`;
  }
  languages["x-default"] = `${SITE_URL}/${routing.defaultLocale}${path}`;
  return languages;
}
