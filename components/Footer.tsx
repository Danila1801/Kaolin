import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

// Site footer. The KVK number and email are deliberate placeholders until the
// studio is registered and a domain is bought — they're translated strings so
// swapping them later is a one-line edit per locale, not a code change.
export default async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto w-full max-w-[1320px] px-6 py-14 sm:px-10 sm:py-18 lg:px-12">
        <div className="flex flex-col gap-12 md:flex-row md:justify-between">
          <div>
            <div className="font-display text-4xl font-semibold lowercase tracking-[-0.07em]">
              kaolin
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
