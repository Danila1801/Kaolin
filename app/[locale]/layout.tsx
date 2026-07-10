import type { Metadata } from "next";
import { DM_Sans, Fraunces, PT_Sans, PT_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

// Cyrillic fallbacks for /ru — Fraunces and DM Sans don't ship Cyrillic glyphs.
// preload: false keeps them off the critical path for the Latin locales.
const ptSerif = PT_Serif({
  weight: ["400", "700"],
  subsets: ["cyrillic"],
  variable: "--font-pt-serif",
  display: "swap",
  preload: false,
});

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

export const metadata: Metadata = {
  title: "kaolin — AI implementation studio",
  description:
    "Websites that think. A father–son studio building sites, chatbots, document assistants, and automation.",
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
      className={`${fraunces.variable} ${dmSans.variable} ${ptSerif.variable} ${ptSans.variable} antialiased`}
    >
      <body className="min-h-screen">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
