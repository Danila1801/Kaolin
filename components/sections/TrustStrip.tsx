import { getTranslations } from "next-intl/server";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";

// A quiet full-width band in the card color, right under the hero. It carries
// the studio's one-line credibility claim — who we are and that you deal with
// us directly. Full-bleed background, so it wraps Section rather than sitting
// inside it.
export default async function TrustStrip() {
  const t = await getTranslations("trust");

  return (
    <div className="bg-card border-y border-ink/5">
      <Section id="trust" className="py-10 sm:py-12 lg:py-16">
        <Reveal>
          <p className="font-display text-muted max-w-[52ch] text-xl lowercase sm:text-2xl">
            {t("line")}
          </p>
        </Reveal>
      </Section>
    </div>
  );
}
