"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels: Record<(typeof routing.locales)[number], string> = {
  en: "EN",
  nl: "NL",
  ro: "RO",
  ru: "RU",
};

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label="Language" className="flex items-center gap-1">
      {routing.locales.map((l) => (
        <Link
          key={l}
          href={pathname}
          locale={l}
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
