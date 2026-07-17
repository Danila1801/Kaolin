import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";
import HeaderNightWatch from "./HeaderNightWatch";

// Sticky top bar. It's a server component: the nav labels are translated at
// request time. The bar is transparent; its type inherits one colour from
// .site-header — ink over the light sky phases, cream while the night act sits
// behind it (HeaderNightWatch flips [data-night] in sync with the field). Every
// child leaves its own colour unset so it follows that single switch.
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
    <header className="site-header sticky top-0 z-50">
      <HeaderNightWatch />
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-[1.45rem] font-semibold lowercase tracking-[-0.06em]"
        >
          {/* The wind-sprout mark — a grass blade unfurling into a spirit
              coil; currentColor so it self-inverts with the text. */}
          <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path
              d="M5.5 26.5 C 11.5 26.2 17.5 24.8 21.4 21.4 C 25.6 17.7 26.3 11.8 22.6 9 C 19.2 6.4 14.2 7.6 12.6 11.3 C 11.2 14.6 13.2 18.3 16.8 18.5 C 19.2 18.6 20.9 16.7 20.4 14.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          kaolin
        </Link>

        {/* Desktop: inline nav + language switcher */}
        <div className="hidden items-center gap-7 md:flex">
          <nav aria-label={t("primary")} className="flex items-center gap-7">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.82rem] font-medium opacity-70 transition-opacity hover:opacity-100"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <LanguageSwitcher variant="header" />
        </div>

        {/* Mobile: hamburger menu */}
        <MobileMenu />
      </div>
    </header>
  );
}
