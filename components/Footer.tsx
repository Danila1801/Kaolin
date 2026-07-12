import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

// Site footer. The KVK number and email are deliberate placeholders until the
// studio is registered and a domain is bought — they're translated strings so
// swapping them later is a one-line edit per locale, not a code change.
export default async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="bg-pine text-cream">
      <div className="mx-auto w-full max-w-[1320px] px-6 py-14 sm:px-10 sm:py-18 lg:px-12">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path
                  d="M5.5 26.5 C 11.5 26.2 17.5 24.8 21.4 21.4 C 25.6 17.7 26.3 11.8 22.6 9 C 19.2 6.4 14.2 7.6 12.6 11.3 C 11.2 14.6 13.2 18.3 16.8 18.5 C 19.2 18.6 20.9 16.7 20.4 14.5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-display text-4xl font-semibold lowercase tracking-[-0.07em]">
                kaolin
              </span>
            </div>
            <p className="mt-4 max-w-[30ch] text-cream/65">{t("tagline")}</p>
          </div>

          <div className="flex flex-col gap-2 text-sm text-cream/65">
            <a
              href={`mailto:${t("email")}`}
              className="w-fit text-cream hover:text-sand transition-colors"
            >
              {t("email")}
            </a>
            <span>{t("kvk")}</span>
            <span>{t("location")}</span>
          </div>

          <LanguageSwitcher variant="inverse" />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-cream/20 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-cream/55">{t("rights")}</p>
          <nav
            aria-label={t("legal.label")}
            className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream/65"
          >
            <Link href="/privacy" className="hover:text-sand transition-colors">
              {t("legal.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-sand transition-colors">
              {t("legal.terms")}
            </Link>
            <Link href="/cookies" className="hover:text-sand transition-colors">
              {t("legal.cookies")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
