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

      <div className="mt-16 grid grid-cols-1 border-t border-ink/15 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal key={item.step} delay={i * 0.06}>
            <div className="min-h-64 border-b border-ink/15 py-7 sm:border-r sm:px-7 sm:py-9 lg:min-h-72 lg:px-8">
              <div className="text-[0.72rem] font-bold tracking-[0.15em] text-rust">{item.step}</div>
              <h3 className="font-display mt-9 text-2xl leading-[1.02] tracking-[-0.045em] lowercase">
                {item.name}
              </h3>
              <p className="mt-4 text-base text-muted">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
