import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Section from "@/components/Section";

type LegalSection = { h: string; p: string[] };

// Renders one legal document from the "legal" message namespace. All four
// locales share this layout; only the copy in messages/*.json changes. Content
// is kept in the message files (not here) so it's translatable and reviewable
// without touching code — the same reason Leonid's bio lives in copy.
export default async function LegalDoc({
  doc,
}: {
  doc: "privacy" | "terms" | "cookies";
}) {
  const t = await getTranslations("legal");
  const sections = t.raw(`${doc}.sections`) as LegalSection[];

  return (
    <Section className="pt-12 sm:pt-20">
      <div className="max-w-[70ch]">
        <Link
          href="/"
          className="text-muted hover:text-ink text-sm transition-colors"
        >
          {t("backHome")}
        </Link>

        <h1 className="font-display mt-6 text-3xl tracking-[-0.02em] lowercase sm:text-4xl">
          {t(`${doc}.title`)}
        </h1>
        <p className="text-muted mt-3 text-sm">{t("updated")}</p>
        <p className="text-muted mt-6 text-lg">{t(`${doc}.intro`)}</p>

        <div className="mt-10 flex flex-col gap-8">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-display text-xl">{s.h}</h2>
              {s.p.map((para, j) => (
                <p key={j} className="text-muted mt-3 leading-relaxed">
                  {para}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </Section>
  );
}
