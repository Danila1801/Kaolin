import { getTranslations } from "next-intl/server";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/sections/ContactForm";

// "contact" — the closing call. A real Formspree-backed form (client component)
// with the direct email kept as an honest fallback. The email is a placeholder
// domain until one is bought.
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

        <ContactForm />

        <Reveal delay={0.1}>
          <p className="text-muted mt-6 text-base">
            {t("or")}{" "}
            <a
              href={`mailto:${email}`}
              className="text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
            >
              {email}
            </a>
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
