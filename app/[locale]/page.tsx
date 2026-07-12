import { getTranslations, setRequestLocale } from "next-intl/server";
import Section from "@/components/Section";
import BotanicalField from "@/components/BotanicalField";
import TrustStrip from "@/components/sections/TrustStrip";
import Services from "@/components/sections/Services";
import Work from "@/components/sections/Work";
import Process from "@/components/sections/Process";
import Proof from "@/components/sections/Proof";
import Pricing from "@/components/sections/Pricing";
import Contact from "@/components/sections/Contact";

export default async function HomePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("hero");
  const nav = await getTranslations("nav");

  return (
    <>
      {/* The foreground stays intentionally calm and fully legible. The plant
          field is a lower, decorative layer - a visual signature, not a gimmick. */}
      <section id="top" className="hero-shell scroll-mt-24">
        <BotanicalField className="hero-field hero-field-back text-moss" />
        <BotanicalField className="hero-field hero-field-front text-ink" />
        <div className="hero-sun" aria-hidden="true" />
        <Section className="relative z-10 flex min-h-[min(760px,calc(100svh-72px))] flex-col justify-between py-16 sm:py-20 lg:py-24">
          <div className="hero-kicker">
            <span className="hero-kicker-dot" aria-hidden="true" />
            Amsterdam <span aria-hidden="true">x</span> Chișinău
          </div>

          <div className="max-w-[940px] pb-12 sm:pb-16 lg:pb-12">
            <h1 className="font-display hero-title">{t("title")}</h1>
            <p className="hero-copy">{t("subtitle")}</p>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4 sm:mt-10">
              <a href="#work" className="button-primary">
                {nav("work")} <span aria-hidden="true">↘</span>
              </a>
              <a href="#contact" className="button-secondary">
                {nav("contact")} <span aria-hidden="true">↘</span>
              </a>
            </div>
          </div>

          <div className="hero-meta" aria-hidden="true">
            <span>AI implementation studio</span>
            <span>Web · AI · Automation</span>
          </div>
        </Section>
      </section>

      <TrustStrip />
      <Services />
      <Work />
      <Process />
      <Proof />
      <Pricing />
      <Contact />
    </>
  );
}
