import { getTranslations } from "next-intl/server";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";

type Step = { step: string; name: string; body: string };

// "how we work" — four numbered steps. The big rust step numbers do the visual
// work; no icons, no illustration. Two columns on tablet, four across on wide.
export default async function Process() {
  const t = await getTranslations("process");
  const items = t.raw("items") as Step[];

  return (
    <Section id="process">
      <Reveal className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-end">
        <h2 className="font-display section-title lowercase">{t("title")}</h2>
        <p className="section-intro lg:mb-1">{t("intro")}</p>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-12 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal key={item.step} delay={i * 0.06}>
            <div>
              <div className="text-[0.82rem] font-bold tracking-[0.14em] text-sand">{item.step}</div>
              <h3 className="font-display mt-6 text-2xl leading-[1.05] tracking-[-0.045em] lowercase">
                {item.name}
              </h3>
              <p className="mt-4 text-lg text-cream/80">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
