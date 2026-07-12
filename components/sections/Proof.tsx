import { getTranslations } from "next-intl/server";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";

type Person = { name: string; role: string; body: string };

// "who we are" — the two humans. This is the trust asset, so it's deliberately
// plain: name, role, a few honest sentences. No stock headshots yet.
//
// [PENDING DAD REVIEW] Leonid's bio (proof.items[0] in every messages/*.json)
// is written around "decades of hands-on software development" ONLY — no company
// names, no client names, no government-work claims — per the foundation doc's
// verification caveat. Leonid must confirm/rewrite it from his own facts before
// launch. The wording lives in the message files, not here, so he edits copy.
export default async function Proof() {
  const t = await getTranslations("proof");
  const items = t.raw("items") as Person[];

  return (
    <Section id="proof">
      <Reveal className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-end">
        <h2 className="font-display section-title lowercase">{t("title")}</h2>
        <p className="section-intro lg:mb-1">{t("intro")}</p>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden bg-ink/15 md:mt-20 md:grid-cols-2">
        {items.map((person, i) => (
          <Reveal key={person.name} delay={i * 0.08}>
            <article className="h-full bg-cream p-7 sm:p-10">
              <span className="text-[0.72rem] font-bold tracking-[0.15em] text-rust">
                0{i + 1}
              </span>
              <h3 className="font-display mt-12 text-4xl leading-none tracking-[-0.055em] sm:text-5xl">{person.name}</h3>
              <div className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-moss">
                {person.role}
              </div>
              <p className="mt-8 max-w-[38ch] text-muted">{person.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
