import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

// Site footer. The KVK number and email are deliberate placeholders until the
// studio is registered and a domain is bought — they're translated strings so
// swapping them later is a one-line edit per locale, not a code change.
export default async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-ink/10 mt-24">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-16 sm:px-12">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <div className="font-display text-xl font-semibold lowercase tracking-tight">
              kaolin
            </div>
            <p className="text-muted mt-3 max-w-[36ch]">{t("tagline")}</p>
          </div>

          <div className="text-muted flex flex-col gap-2 text-sm">
            <a
              href={`mailto:${t("email")}`}
              className="hover:text-ink w-fit transition-colors"
            >
              {t("email")}
            </a>
            <span>{t("kvk")}</span>
            <span>{t("location")}</span>
          </div>

          <LanguageSwitcher />
        </div>

        <div className="border-ink/10 mt-12 flex flex-col gap-4 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted text-sm">{t("rights")}</p>
          <nav
            aria-label="Legal"
            className="text-muted flex flex-wrap gap-x-6 gap-y-2 text-sm"
          >
            <Link href="/privacy" className="hover:text-ink transition-colors">
              {t("legal.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-ink transition-colors">
              {t("legal.terms")}
            </Link>
            <Link href="/cookies" className="hover:text-ink transition-colors">
              {t("legal.cookies")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
