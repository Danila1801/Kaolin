import { getTranslations } from "next-intl/server";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";

type ServiceItem = { name: string; body: string };

// "what we do" — an editorial list, not a grid of icon-cards. Each service is a
// two-column row (name | description) separated by hairline rules. This reads
// as considered rather than templated, which is the whole brief.
export default async function Services() {
  const t = await getTranslations("services");
  const items = t.raw("items") as ServiceItem[];

  return (
    <Section id="services">
      <Reveal>
        <h2 className="font-display text-2xl tracking-[-0.02em] lowercase sm:text-3xl">
          {t("title")}
        </h2>
        <p className="text-muted mt-6 max-w-[65ch] text-xl">{t("intro")}</p>
      </Reveal>

      <div className="mt-12 sm:mt-16">
        {items.map((item, i) => (
          <Reveal key={item.name} delay={i * 0.05}>
            <div className="border-ink/10 grid grid-cols-1 gap-2 border-t py-6 md:grid-cols-[1fr_2fr] md:gap-10">
              <h3 className="font-display text-xl lowercase">{item.name}</h3>
              <p className="text-muted">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
