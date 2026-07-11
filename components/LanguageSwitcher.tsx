"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels: Record<(typeof routing.locales)[number], string> = {
  en: "EN",
  nl: "NL",
  ro: "RO",
  ru: "RU",
};

// Full names for the accessible label, so a screen reader announces
// "English", not "E N". The visible chip stays the two-letter code.
const names: Record<(typeof routing.locales)[number], string> = {
  en: "English",
  nl: "Nederlands",
  ro: "Română",
  ru: "Русский",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav aria-label={t("language")} className="flex items-center gap-1">
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
          hrefLang={l}
          lang={l}
          aria-label={`${labels[l]} — ${names[l]}`}
          aria-current={l === locale ? "true" : undefined}
          className={`rounded-full px-3 py-1.5 text-sm tracking-wide transition-colors ${
            l === locale ? "bg-ink text-cream" : "text-muted hover:text-ink"
          }`}
        >
          {labels[l]}
        </Link>
      ))}
    </nav>
  );
}
