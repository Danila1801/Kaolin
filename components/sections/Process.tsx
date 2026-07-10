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
      <Reveal>
        <h2 className="font-display text-2xl tracking-[-0.02em] lowercase sm:text-3xl">
          {t("title")}
        </h2>
        <p className="text-muted mt-6 max-w-[65ch] text-xl">{t("intro")}</p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal key={item.step} delay={i * 0.06}>
            <div>
              <div className="font-display text-rust text-3xl">{item.step}</div>
              <h3 className="font-display mt-3 text-xl lowercase">
                {item.name}
              </h3>
              <p className="text-muted mt-2 text-base">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
