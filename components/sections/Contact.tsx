import { getTranslations } from "next-intl/server";
import Section from "@/components/Section";
import Reveal from "@/components/Reveal";
import ContactForm from "@/components/sections/ContactForm";

export default async function Contact() {
  const t = await getTranslations("contact");
  const email = t("email");

  return (
    <div className="bg-forest text-cream">
      {/* Trimmed bottom padding so the pine footer follows directly instead of a
          long green void. (Longhand pb-* overrides Section's py-* bottom.) */}
      <Section id="contact" className="pb-8 sm:pb-10 lg:pb-12">
        <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
          <Reveal className="max-w-[34rem]">
            <span aria-hidden="true" className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-sand">
              ---
            </span>
            <h2 className="font-display mt-5 text-[clamp(3rem,5vw,5.6rem)] leading-[0.92] tracking-[-0.06em] lowercase">
              {t("title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-cream/75">{t("body")}</p>
          </Reveal>

          <div>
            <ContactForm />
            <Reveal delay={0.1}>
              <p className="mt-6 text-sm text-cream/70">
                {t("or")} {" "}
                <a
                  href={`mailto:${email}`}
                  className="text-cream underline decoration-sand/60 underline-offset-4 hover:decoration-cream"
                >
                  {email}
                </a>
              </p>
            </Reveal>
          </div>
        </div>
      </Section>
    </div>
  );
}
