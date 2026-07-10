import { getTranslations, setRequestLocale } from "next-intl/server";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";

// The homepage is a single scroll. Each block below is a stub for now — just a
// heading inside the shared <Section> primitive — so the whole skeleton and its
// spacing/anchor navigation is real and reviewable. Day 3 fills these with copy.
// Order is fixed by the strategy doc: hero → trust → what we do → see it for
// real → how we work → who we are → pricing → contact.
const stubSections = [
  "services",
  "work",
  "process",
  "proof",
  "pricing",
  "contact",
] as const;

export default async function HomePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <>
      {/* Hero — not wrapped in Reveal: it's above the fold and must be
          visible instantly, before any hydration or scroll. */}
      <Section id="top" className="pt-12 sm:pt-20 lg:pt-24">
        <h1 className="font-display max-w-[16ch] text-3xl tracking-[-0.02em] sm:text-5xl">
          {t("hero.title")}
        </h1>
        <p className="text-muted mt-8 max-w-[65ch] text-xl">
          {t("hero.subtitle")}
        </p>
      </Section>

      {/* Trust strip — a quiet full-width band in the card color. */}
      <div className="bg-card border-y border-ink/5">
        <Section id="trust" className="py-10 sm:py-12 lg:py-16">
          <Reveal>
            <p className="font-display text-muted text-xl lowercase sm:text-2xl">
              {t("sections.trust")}
            </p>
          </Reveal>
        </Section>
      </div>

      {stubSections.map((key) => (
        <Section key={key} id={key}>
          <Reveal>
            <h2 className="font-display text-2xl tracking-[-0.02em] lowercase sm:text-3xl">
              {t(`sections.${key}`)}
            </h2>
            <p className="text-muted/70 mt-4 text-base">
              {t("sections.placeholder")}
            </p>
          </Reveal>
        </Section>
      ))}
    </>
  );
}
