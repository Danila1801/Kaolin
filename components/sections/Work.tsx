import { getTranslations } from "next-intl/server";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";

type WorkItem = {
  name: string;
  body: string;
  cta: string;
  href: string;
  tag?: string; // optional badge — used to mark the AI-assistant demo
};

// "see it for real" — the standout is the first item: a demo clinic with a live
// AI intake assistant you can talk to, rendered as a wide featured card so the
// AI-integration capability leads the section. The remaining real, deployed
// sites follow in a two-up grid. External links open in a new tab with
// rel="noopener" so a demo can't script back to this window.
export default async function Work() {
  const t = await getTranslations("work");
  const items = t.raw("items") as WorkItem[];
  const [featured, ...rest] = items;

  return (
    <Section id="work">
      <Reveal>
        <h2 className="font-display text-2xl tracking-[-0.02em] lowercase sm:text-3xl">
          {t("title")}
        </h2>
        <p className="text-muted mt-6 max-w-[65ch] text-xl">{t("intro")}</p>
      </Reveal>

      {featured && (
        <Reveal delay={0.04}>
          <a
            href={featured.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group border-rust/30 bg-card hover:border-rust/60 mt-12 flex flex-col rounded-2xl border p-8 transition-colors sm:p-10"
          >
            {featured.tag && (
              <span className="text-rust border-rust/30 bg-rust/5 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.12em]">
                <span className="bg-rust h-1.5 w-1.5 rounded-full" />
                {featured.tag}
              </span>
            )}
            <h3 className="font-display mt-4 text-2xl lowercase sm:text-3xl">
              {featured.name}
            </h3>
            <p className="text-muted mt-3 max-w-[60ch] text-lg">{featured.body}</p>
            <span className="text-rust mt-6 inline-flex items-center gap-1 text-sm font-medium">
              {featured.cta}
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </a>
        </Reveal>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {rest.map((item, i) => (
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
        <p className="text-muted mt-8 max-w-[60ch] text-base italic">
          {t("note")}
        </p>
      </Reveal>
    </Section>
  );
}
