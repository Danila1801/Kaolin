import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu from "./MobileMenu";

// Sticky top bar. It's a server component: the nav labels are translated at
// request time. The bar itself is transparent; the wordmark and nav render in
// white behind mix-blend-mode: difference, so they self-invert against the
// field — near-black over the ivory daylight, near-white over the dark act.
// The MobileMenu panel intentionally stays OUTSIDE any blended element (a
// blended ancestor would invert the whole cream panel).
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
      <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-12">
        <Link
          href="/"
          className="blend-diff font-display text-[1.45rem] font-semibold lowercase tracking-[-0.06em] text-white"
        >
          kaolin
        </Link>

        {/* Desktop: inline nav + language switcher */}
        <div className="hidden items-center gap-7 md:flex">
          <nav aria-label={t("primary")} className="blend-diff flex items-center gap-7">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.82rem] font-medium text-white/70 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="blend-diff">
            <LanguageSwitcher variant="blend" />
          </div>
        </div>

        {/* Mobile: hamburger menu */}
        <MobileMenu />
      </div>
    </header>
  );
}
