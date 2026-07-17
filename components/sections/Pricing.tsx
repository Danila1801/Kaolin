import { getTranslations } from "next-intl/server";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";

type Tier = { name: string; from: string; body: string; features: string[] };

// "pricing" — no fixed prices. Every project is scoped on a free call, so the
// section shows what each kind of work includes (name + plain line + a few
// points), never a euro figure. No boxes or borders: columns are set apart by
// space and the step-like rhythm alone. The `from` field in the messages is
// intentionally no longer rendered.
export default async function Pricing() {
  const t = await getTranslations("pricing");
  const tiers = t.raw("tiers") as Tier[];

  return (
    <Section id="pricing" className="section-veil">
      <Reveal className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-end">
        <h2 className="font-display section-title lowercase">{t("title")}</h2>
        <p className="section-intro lg:mb-1">{t("intro")}</p>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 gap-x-12 gap-y-14 md:mt-20 md:grid-cols-3">
        {tiers.map((tier, i) => (
          <Reveal key={tier.name} delay={i * 0.06}>
            <div className="flex flex-col">
              <h3 className="font-display text-2xl leading-none tracking-[-0.045em] lowercase">{tier.name}</h3>
              <p className="mt-5 text-lg text-muted">{tier.body}</p>
              <ul className="mt-7 flex flex-col gap-3 text-base">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-0.5 leading-none text-rust">
                      ✓
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <p className="mt-14 max-w-[46rem] text-lg text-muted">{t("footnote")}</p>
      </Reveal>
    </Section>
  );
}
