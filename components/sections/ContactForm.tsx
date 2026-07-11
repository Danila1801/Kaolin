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
          className="border-rust/30 bg-card mt-8 max-w-[55ch] rounded-2xl border p-6 text-lg"
        >
          {t("form.success")}
        </p>
      </Reveal>
    );
  }

  return (
    <Reveal delay={0.06}>
      <form onSubmit={onSubmit} className="mt-8 max-w-[55ch]">
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
            <span className="text-sm font-medium">{t("form.name")}</span>
            <input
              type="text"
              name="name"
              required
              autoComplete="name"
              className="border-ink/15 bg-card focus:border-rust w-full rounded-xl border px-4 py-3 transition-colors"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">{t("form.email")}</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="border-ink/15 bg-card focus:border-rust w-full rounded-xl border px-4 py-3 transition-colors"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">{t("form.message")}</span>
            <textarea
              name="message"
              required
              rows={5}
              className="border-ink/15 bg-card focus:border-rust w-full resize-y rounded-xl border px-4 py-3 transition-colors"
            />
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="bg-rust hover:bg-rust/90 rounded-full px-6 py-3 text-base font-medium text-cream transition-colors disabled:opacity-60"
            >
              {status === "submitting" ? t("form.sending") : t("form.send")}
            </button>
            {status === "error" && (
              <span role="alert" className="text-rust text-sm">
                {t("form.error")}
              </span>
            )}
          </div>
        </div>
      </form>
    </Reveal>
  );
}
