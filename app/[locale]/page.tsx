import { getTranslations, setRequestLocale } from "next-intl/server";
import Section from "@/components/Section";
import BotanicalScene from "@/components/BotanicalScene";
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
      {/* The living field: fixed behind everything, scroll drives the camera
          deeper, and it turns to night behind the [data-scene-dark] act below.
          Decorative only — every word stays legible without it. */}
      <BotanicalScene wind={1.6} density="standard" grain="on" />

      {/* overflow-x-clip: decorative bleeds (.section-veil) must never create
          horizontal scroll on mobile */}
      <div className="relative z-10 overflow-x-clip">
        <section id="top" className="hero-shell scroll-mt-24">
          <Section className="flex min-h-[min(760px,calc(100svh-72px))] flex-col justify-between py-16 sm:py-20 lg:py-24">
            <div className="hero-kicker">
              <span className="hero-kicker-dot" aria-hidden="true" />
              Amsterdam <span aria-hidden="true">x</span> Chișinău
            </div>

            {/* hero-veil + the field's cleared corridor keep the copy readable */}
            <div className="hero-veil max-w-[940px] pb-12 sm:pb-16 lg:pb-12">
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

        {/* The dark act: the field behind these three turns to night — grass
            silhouettes, sand-lit tips — then returns to daylight for pricing. */}
        <div data-scene-dark="true" className="dark-act">
          <Work />
          <Process />
          <Proof />
        </div>

        <Pricing />
        <Contact />
      </div>
    </>
  );
}
