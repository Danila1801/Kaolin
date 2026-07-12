import { getTranslations } from "next-intl/server";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";

type Tier = { name: string; from: string; body: string; features: string[] };

// "pricing" — three "from €X" anchors, never a full menu. The middle tier
// (website + ai assistant) is the intended sweet spot, so it's highlighted with
// a rust ring. Prices are anchors from the pricing bands in CLAUDE.md; the
// footnote makes clear every project is scoped on a free call.
export default async function Pricing() {
  const t = await getTranslations("pricing");
  const tiers = t.raw("tiers") as Tier[];

  return (
    <Section id="pricing">
      <Reveal className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-end">
        <h2 className="font-display section-title lowercase">{t("title")}</h2>
        <p className="section-intro lg:mb-1">{t("intro")}</p>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 border-t border-ink/15 md:mt-20 md:grid-cols-3">
        {tiers.map((tier, i) => {
          const featured = i === 1;
          return (
            <Reveal key={tier.name} delay={i * 0.06}>
              <div
                className={`flex h-full min-h-[29rem] flex-col border-b border-ink/15 px-0 py-9 md:border-r md:px-8 md:py-10 ${
                  featured
                    ? "bg-sand/35"
                    : ""
                }`}
              >
                <h3 className="font-display text-2xl leading-none tracking-[-0.045em] lowercase">{tier.name}</h3>
                <div className="font-display mt-8 text-4xl leading-none tracking-[-0.055em] text-ink">
                  {tier.from}
                </div>
                <p className="mt-6 text-base text-muted">{tier.body}</p>
                <ul className="mt-8 flex flex-col gap-3 text-sm">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="mt-0.5 leading-none text-rust"
                      >
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal>
        <p className="mt-8 text-sm text-muted">{t("footnote")}</p>
      </Reveal>
    </Section>
  );
}
