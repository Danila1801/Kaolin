import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Section from "@/components/Section";

// Localized 404. Rendered inside the [locale] layout, so it keeps the header,
// footer, and language switcher — a dead end that still feels like the site.
export default async function NotFound() {
  const t = await getTranslations("error");

  return (
    <Section className="flex min-h-[60vh] flex-col items-start justify-center">
      <div className="font-display text-rust text-5xl">{t("notFound.code")}</div>
      <h1 className="font-display mt-4 text-3xl tracking-[-0.02em] lowercase sm:text-4xl">
        {t("notFound.title")}
      </h1>
      <p className="text-muted mt-4 max-w-[50ch] text-xl">{t("notFound.body")}</p>
      <Link
        href="/"
        className="bg-rust hover:bg-rust/90 mt-8 rounded-full px-6 py-3 text-base font-medium text-cream transition-colors"
      >
        {t("notFound.home")}
      </Link>
    </Section>
  );
}
