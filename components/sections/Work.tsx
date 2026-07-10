import { getTranslations } from "next-intl/server";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";

type WorkItem = { name: string; body: string; cta: string; href: string };

// "see it for real" — two real, deployed sites as cards, plus a note tying the
// live chat assistant on this page back to the pitch. External links open in a
// new tab with rel="noopener" so the demo can't script back to this window.
export default async function Work() {
  const t = await getTranslations("work");
  const items = t.raw("items") as WorkItem[];

  return (
    <Section id="work">
      <Reveal>
        <h2 className="font-display text-2xl tracking-[-0.02em] lowercase sm:text-3xl">
          {t("title")}
        </h2>
        <p className="text-muted mt-6 max-w-[65ch] text-xl">{t("intro")}</p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((item, i) => (
          <Reveal key={item.name} delay={i * 0.08}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group border-ink/10 bg-card hover:border-rust/40 flex h-full flex-col rounded-2xl border p-8 transition-colors"
            >
              <h3 className="font-display text-2xl lowercase">{item.name}</h3>
              <p className="text-muted mt-3 flex-1">{item.body}</p>
              <span className="text-rust mt-6 inline-flex items-center gap-1 text-sm font-medium">
                {item.cta}
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </a>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <p className="text-muted/90 mt-8 max-w-[60ch] text-base italic">
          {t("note")}
        </p>
      </Reveal>
    </Section>
  );
}
