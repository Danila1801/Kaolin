import { getTranslations } from "next-intl/server";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";

// "contact" — the closing call. A real form arrives on Day 6; for now the CTA
// and the direct address are both mailto links, which is honest and works
// today. The email is a placeholder domain until one is bought.
export default async function Contact() {
  const t = await getTranslations("contact");
  const email = t("email");

  return (
    <Section id="contact">
      <div className="max-w-[65ch]">
        <Reveal>
          <h2 className="font-display text-2xl tracking-[-0.02em] lowercase sm:text-3xl">
            {t("title")}
          </h2>
          <p className="text-muted mt-6 text-xl">{t("body")}</p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
            <a
              href={`mailto:${email}`}
              className="bg-rust hover:bg-rust/90 rounded-full px-6 py-3 text-base font-medium text-cream transition-colors"
            >
              {t("cta")}
            </a>
            <span className="text-muted text-base">
              {t("or")}{" "}
              <a
                href={`mailto:${email}`}
                className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
              >
                {email}
              </a>
            </span>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
