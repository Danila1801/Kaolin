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
      <Reveal>
        <h2 className="font-display text-2xl tracking-[-0.02em] lowercase sm:text-3xl">
          {t("title")}
        </h2>
        <p className="text-muted mt-6 max-w-[65ch] text-xl">{t("intro")}</p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {tiers.map((tier, i) => {
          const featured = i === 1;
          return (
            <Reveal key={tier.name} delay={i * 0.06}>
              <div
                className={`flex h-full flex-col rounded-2xl border p-8 ${
                  featured
                    ? "border-rust/50 ring-rust/20 bg-card ring-1"
                    : "border-ink/10"
                }`}
              >
                <h3 className="font-display text-xl lowercase">{tier.name}</h3>
                <div className="font-display text-ink mt-3 text-3xl">
                  {tier.from}
                </div>
                <p className="text-muted mt-4 text-base">{tier.body}</p>
                <ul className="mt-6 flex flex-col gap-3 text-base">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span
                        aria-hidden
                        className="text-rust mt-0.5 leading-none"
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
        <p className="text-muted mt-8 text-base">{t("footnote")}</p>
      </Reveal>
    </Section>
  );
}
