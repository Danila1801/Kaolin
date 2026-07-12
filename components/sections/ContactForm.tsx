"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Reveal from "@/components/Reveal";

// Formspree endpoint — a form POST, no backend of our own. The key stays public
// by design (it only accepts submissions; it can't read them), so there's no
// secret to leak here. Spam is handled two ways: Formspree's own filtering, and
// the honeypot field below.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mrenzedl";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("submitting");

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <Reveal>
        <p
          role="status"
          className="mt-8 max-w-[55ch] border border-sand/60 bg-card p-6 text-lg text-ink"
        >
          {t("form.success")}
        </p>
      </Reveal>
    );
  }

  return (
    <Reveal delay={0.06}>
      <form onSubmit={onSubmit} className="max-w-[55ch]">
        {/* Honeypot: hidden from people, tempting to bots. Formspree drops any
            submission where `_gotcha` is filled. aria-hidden + tabIndex keep it
            away from screen readers and keyboard users. */}
        <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
          <label>
            Leave this field empty
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <input type="hidden" name="_subject" value="New message from kaolin.studio" />

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-cream">{t("form.name")}</span>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              className="w-full border border-cream/35 bg-cream px-4 py-3 text-ink transition-colors placeholder:text-muted focus:border-sand"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-cream">{t("form.email")}</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full border border-cream/35 bg-cream px-4 py-3 text-ink transition-colors placeholder:text-muted focus:border-sand"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-cream">{t("form.message")}</span>
            <textarea
              name="message"
              required
              rows={5}
              className="w-full resize-y border border-cream/35 bg-cream px-4 py-3 text-ink transition-colors placeholder:text-muted focus:border-sand"
            />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="bg-sand px-6 py-3 text-base font-semibold text-ink transition-colors hover:bg-cream disabled:opacity-60"
            >
              {status === "submitting" ? t("form.sending") : t("form.send")}
            </button>
            {status === "error" && (
              <span role="alert" className="text-sm text-sand">
                {t("form.error")}
              </span>
            )}
          </div>
        </div>
      </form>
    </Reveal>
  );
}
