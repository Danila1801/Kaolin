"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Section from "@/components/Section";

// Localized error boundary for anything that throws while rendering a page.
// It's a client component (required for error boundaries) and sits inside the
// locale layout, so translations and the design system are available. `reset`
// re-attempts the render.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error("[page] render error:", error);
  }, [error]);

  return (
    <Section className="flex min-h-[60vh] flex-col items-start justify-center">
      <h1 className="font-display text-3xl tracking-[-0.02em] lowercase sm:text-4xl">
        {t("generic.title")}
      </h1>
      <p className="text-muted mt-4 max-w-[50ch] text-xl">{t("generic.body")}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={reset}
          className="bg-rust hover:bg-rust/90 rounded-full px-6 py-3 text-base font-medium text-cream transition-colors"
        >
          {t("generic.retry")}
        </button>
        <Link
          href="/"
          className="border-ink/15 hover:border-ink/40 rounded-full border px-6 py-3 text-base font-medium transition-colors"
        >
          {t("generic.home")}
        </Link>
      </div>
    </Section>
  );
}
