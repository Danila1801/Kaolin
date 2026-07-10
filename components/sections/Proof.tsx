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
      <Reveal>
        <h2 className="font-display text-2xl tracking-[-0.02em] lowercase sm:text-3xl">
          {t("title")}
        </h2>
        <p className="text-muted mt-6 max-w-[65ch] text-xl">{t("intro")}</p>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2">
        {items.map((person, i) => (
          <Reveal key={person.name} delay={i * 0.08}>
            <div className="border-ink/10 border-t pt-6">
              <h3 className="font-display text-2xl">{person.name}</h3>
              <div className="text-rust mt-1 text-xs uppercase tracking-[0.14em]">
                {person.role}
              </div>
              <p className="text-muted mt-4">{person.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
