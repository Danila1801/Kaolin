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
      <Reveal className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-end">
        <h2 className="font-display section-title lowercase">{t("title")}</h2>
        <p className="section-intro lg:mb-1">{t("intro")}</p>
      </Reveal>

      <div className="mt-16 border-t border-ink/15 sm:mt-20">
        {items.map((item, i) => (
          <Reveal key={item.name} delay={i * 0.05}>
            <div className="group grid grid-cols-1 gap-3 border-b border-ink/15 py-8 sm:py-10 md:grid-cols-[4.5rem_minmax(14rem,0.9fr)_minmax(0,1.2fr)] md:gap-8">
              <span className="pt-1 text-[0.72rem] font-bold tracking-[0.13em] text-rust">
                0{i + 1}
              </span>
              <h3 className="font-display text-2xl leading-[1.02] tracking-[-0.045em] lowercase transition-transform duration-300 group-hover:translate-x-1 sm:text-3xl">
                {item.name}
              </h3>
              <p className="max-w-[38rem] text-muted md:pt-1">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
