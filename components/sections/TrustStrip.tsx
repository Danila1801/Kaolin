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
    <div>
      <Section id="trust" className="section-veil py-9 sm:py-11 lg:py-12">
        <Reveal className="grid gap-5 md:grid-cols-[minmax(0,1fr)_2.2fr] md:items-center">
          <span aria-hidden="true" className="flex gap-2 text-moss">
            <i className="block h-2 w-2 rounded-full bg-current" />
            <i className="block h-2 w-8 rounded-full bg-current" />
          </span>
          <p className="font-display max-w-[48ch] text-2xl leading-[1.1] tracking-[-0.04em] lowercase sm:text-3xl">
            {t("line")}
          </p>
        </Reveal>
      </Section>
    </div>
  );
}
