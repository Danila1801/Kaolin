import { getTranslations, setRequestLocale } from "next-intl/server";
import Section from "@/components/Section";
import TrustStrip from "@/components/sections/TrustStrip";
import Services from "@/components/sections/Services";
import Work from "@/components/sections/Work";
import Process from "@/components/sections/Process";
import Proof from "@/components/sections/Proof";
import Pricing from "@/components/sections/Pricing";
import Contact from "@/components/sections/Contact";

// The homepage is one scroll, composed from section components in the order the
// strategy doc fixes: hero → trust → what we do → see it for real → how we work
// → who we are → pricing → contact. Each section owns its own copy and layout;
// this file just sequences them.
export default async function HomePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("hero");

  return (
    <>
      {/* Hero — not wrapped in Reveal: above the fold, must show instantly. */}
      <Section id="top" className="pt-12 sm:pt-20 lg:pt-24">
        <h1 className="font-display max-w-[16ch] text-3xl tracking-[-0.02em] sm:text-5xl">
          {t("title")}
        </h1>
        <p className="text-muted mt-8 max-w-[65ch] text-xl">{t("subtitle")}</p>
      </Section>

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
