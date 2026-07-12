import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, PT_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { routing } from "@/i18n/routing";
import { OG_LOCALE, SITE_URL, localeAlternates } from "@/lib/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import ChatErrorBoundary from "@/components/chat/ErrorBoundary";
import "../globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

// Inter ships Cyrillic itself, so /ru body text never needs a fallback.
const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

// Cyrillic fallback for /ru display type — Bricolage Grotesque has no
// Cyrillic. preload: false keeps it off the critical path for Latin locales.
const ptSans = PT_Sans({
  weight: ["400", "700"],
  subsets: ["cyrillic"],
  variable: "--font-pt-sans",
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Per-locale metadata: localized title/description, canonical for this locale,
// and hreflang alternates covering all four languages + x-default. `%s · kaolin`
// lets child pages (legal) set just their own name.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: "%s · kaolin" },
    description: t("description"),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: localeAlternates(),
    },
    openGraph: {
      type: "website",
      siteName: "kaolin",
      url: `${SITE_URL}/${locale}`,
      title: t("title"),
      description: t("description"),
      locale: OG_LOCALE[locale] ?? "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

// Organization schema for rich results. Deliberately conservative: it publishes
// only what's true today (the two people, what we do, where we work).
// [PENDING — confirm before launch] No legal registration number (KVK),
// registered address, or VAT ID is published here yet — the studio isn't
// registered. Add them once confirmed; do not invent a number. This mirrors the
// [PENDING DAD REVIEW] handling of Leonid's bio in Proof.tsx.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Kaolin",
  url: SITE_URL,
  description:
    "A father–son AI-implementation studio building websites, chatbots, document assistants, and automation.",
  email: "hello@kaolin.studio",
  founder: [
    { "@type": "Person", name: "Leonid" },
    { "@type": "Person", name: "Danila" },
  ],
  areaServed: ["NL", "MD", "EU"],
  knowsAbout: [
    "Web development",
    "Large language models",
    "Retrieval-augmented generation",
    "Machine learning",
    "Business automation",
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${bricolage.variable} ${inter.variable} ${ptSans.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatErrorBoundary>
            <ChatWidget />
          </ChatErrorBoundary>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
