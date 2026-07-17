// [PENDING — confirm before launch]
// This cookie & AI-transparency notice names the studio and its contact email
// but intentionally does NOT publish a KVK (Chamber of Commerce) number or
// registered business address — the studio isn't registered and the domain
// isn't owned yet. These placeholders live in messages/*.json → legal and MUST
// be confirmed and filled in before this page is published. Same handling as
// Leonid's [PENDING DAD REVIEW] bio in components/sections/Proof.tsx.

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { OG_LOCALE, SITE_URL, localeAlternates } from "@/lib/site";
import LegalDoc from "@/components/legal/LegalDoc";

const PATH = "/cookies";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return {
    title: t("cookies.meta.title"),
    description: t("cookies.meta.description"),
    alternates: {
      canonical: `${SITE_URL}/${locale}${PATH}`,
      languages: localeAlternates(PATH),
    },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/${locale}${PATH}`,
      title: t("cookies.meta.title"),
      description: t("cookies.meta.description"),
      locale: OG_LOCALE[locale] ?? "en_US",
    },
  };
}

export default async function CookiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalDoc doc="cookies" />;
}
