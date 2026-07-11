"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

// Same in-page anchors as the desktop nav; labels come from the `nav` namespace.
const LINKS = [
  { href: "#services", key: "services" },
  { href: "#work", key: "work" },
  { href: "#process", key: "process" },
  { href: "#pricing", key: "pricing" },
  { href: "#contact", key: "contact" },
] as const;

// The mobile navigation. Below the md breakpoint the desktop nav + language
// switcher are hidden; this hamburger takes their place and opens a cream panel
// holding the same links and the switcher. It's a real dialog for keyboard
// users: focus moves in on open, Tab is trapped, Escape (and tapping a link, the
// backdrop, or the close button) closes it and returns focus to the toggle.
export default function MobileMenu() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function close() {
    setOpen(false);
    buttonRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    // Move focus into the panel (its first focusable is the close button).
    panel?.querySelector<HTMLElement>("button, a[href]")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !panel) return;
      const f = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    // Stop the page behind the panel from scrolling while it's open.
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        className="text-ink -mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop — tap to dismiss. */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={close}
            className="bg-ink/20 fixed inset-0 z-50 cursor-default"
          />

          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={t("menu")}
            className="border-ink/10 bg-cream fixed inset-x-0 top-0 z-50 border-b px-6 pt-4 pb-8 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-semibold lowercase tracking-tight">
                kaolin
              </span>
              <button
                type="button"
                onClick={close}
                aria-label={t("closeMenu")}
                className="text-ink -mr-2 inline-flex h-10 w-10 items-center justify-center rounded-full"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            <nav aria-label={t("primary")} className="mt-6 flex flex-col">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className="text-ink hover:text-rust border-ink/10 border-b py-3 text-lg lowercase transition-colors"
                >
                  {t(l.key)}
                </a>
              ))}
            </nav>

            <div className="mt-6">
              <LanguageSwitcher />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
