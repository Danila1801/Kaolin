import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";

// Sticky top bar. It's a server component: the nav labels are translated at
// request time. On desktop it shows the inline nav + language switcher; below
// the md breakpoint both are hidden and the (client) MobileMenu hamburger takes
// over. The wordmark uses the locale-aware Link so "/" resolves to "/en", etc.
// The section links are plain in-page anchors (#services) — they scroll within
// the current locale's page, no routing involved.
export default async function Header() {
  const t = await getTranslations("nav");

  const items = [
    { href: "#services", label: t("services") },
    { href: "#work", label: t("work") },
    { href: "#process", label: t("process") },
    { href: "#pricing", label: t("pricing") },
    { href: "#contact", label: t("contact") },
  ];

  return (
    <header className="site-header sticky top-0 z-50 transition-colors">
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-12">
        <Link
          href="/"
          className="font-display text-[1.45rem] font-semibold lowercase tracking-[-0.06em]"
        >
          kaolin
        </Link>

        {/* Desktop: inline nav + language switcher */}
        <div className="hidden items-center gap-7 md:flex">
          <nav aria-label={t("primary")} className="flex items-center gap-7">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-muted hover:text-rust text-[0.82rem] font-medium transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <LanguageSwitcher />
        </div>

        {/* Mobile: hamburger menu */}
        <MobileMenu />
      </div>
    </header>
  );
}
