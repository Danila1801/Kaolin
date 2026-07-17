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
//
// Light-zone section: it sits in the sunset phase (bright amber sky), NOT in the
// [data-scene-dark] act, so its type is dark ink on a .section-veil — the same
// legibility contract as Services/Pricing. (It once carried ivory type for a
// dark background; that left it washed out over the warm sky. Fixed.)
export default async function Work() {
  const t = await getTranslations("work");
  const items = t.raw("items") as WorkItem[];
  const [featured, ...rest] = items;

  return (
    <Section id="work" className="section-veil">
      <Reveal className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-end">
        <h2 className="font-display max-w-[14ch] text-[clamp(2.7rem,5vw,5.35rem)] leading-[0.94] tracking-[-0.055em] lowercase">
          {t("title")}
        </h2>
        <p className="section-intro max-w-[42rem] lg:mb-1">{t("intro")}</p>
      </Reveal>

      {featured && (
        <Reveal delay={0.04}>
          <a
            href={featured.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-14 flex flex-col bg-card p-7 text-ink shadow-[0_1px_28px_rgba(25,27,23,0.07)] transition-shadow hover:shadow-[0_4px_36px_rgba(25,27,23,0.12)] sm:mt-20 sm:p-11"
          >
            {featured.tag && (
              <span className="inline-flex w-fit items-center gap-2 border border-rust/30 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-rust">
                <span className="h-1.5 w-1.5 rounded-full bg-rust" />
                {featured.tag}
              </span>
            )}
            <h3 className="font-display mt-5 max-w-[17ch] text-3xl leading-[0.98] tracking-[-0.045em] lowercase sm:text-5xl">
              {featured.name}
            </h3>
            <p className="mt-5 max-w-[55ch] text-muted">{featured.body}</p>
            <span className="mt-9 inline-flex items-center gap-2 text-sm font-bold text-rust">
              {featured.cta}
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </a>
        </Reveal>
      )}

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        {rest.map((item, i) => (
          <Reveal key={item.name} delay={i * 0.08}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col p-7 text-ink transition-colors sm:px-0 sm:py-2"
            >
              <h3 className="font-display text-3xl leading-none tracking-[-0.045em] lowercase transition-colors group-hover:text-rust">
                {item.name}
              </h3>
              <p className="mt-4 flex-1 text-lg text-muted">{item.body}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-base font-bold text-rust">
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
        <p className="mt-9 max-w-[60ch] border-t border-ink/15 pt-5 text-sm italic text-muted">
          {t("note")}
        </p>
      </Reveal>
    </Section>
  );
}
