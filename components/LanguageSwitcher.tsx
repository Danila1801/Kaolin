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

// Three contexts: "light" on cream surfaces (mobile menu), "inverse" on the
// ink footer, and "blend" inside the header's mix-blend-mode: difference
// wrapper — white-based so it self-inverts cleanly against the field.
type Variant = "light" | "inverse" | "blend";

const styles: Record<Variant, { active: string; idle: string }> = {
  light: { active: "bg-ink text-cream", idle: "text-muted hover:text-ink" },
  inverse: { active: "bg-cream text-ink", idle: "text-cream/60 hover:text-cream" },
  blend: {
    active: "text-white underline decoration-1 underline-offset-4",
    idle: "text-white/55 hover:text-white",
  },
};

export default function LanguageSwitcher({ variant = "light" }: { variant?: Variant }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const s = styles[variant];

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
            l === locale ? s.active : s.idle
          }`}
        >
          {labels[l]}
        </Link>
      ))}
    </nav>
  );
}
