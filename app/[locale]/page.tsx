import { getTranslations, setRequestLocale } from "next-intl/server";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default async function HomePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("hero");

  return (
    <>
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-8 sm:px-12">
        <span className="font-display text-xl font-semibold lowercase tracking-tight">
          kaolin
        </span>
        <LanguageSwitcher />
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-6 pt-16 pb-24 sm:px-12 sm:pt-24 sm:pb-32">
        <h1 className="font-display max-w-[16ch] text-3xl tracking-[-0.02em] sm:text-5xl">
          {t("title")}
        </h1>
        <p className="text-muted mt-8 max-w-[65ch] text-xl">{t("subtitle")}</p>
      </main>
    </>
  );
}
