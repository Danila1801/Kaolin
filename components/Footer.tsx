import { getTranslations } from "next-intl/server";
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

        <p className="text-muted/80 mt-12 text-sm">{t("rights")}</p>
      </div>
    </footer>
  );
}
