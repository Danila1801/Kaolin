import type { ReactNode } from "react";
import Link from "next/link";
import { requireAuth } from "@/lib/dashboard-auth";
import { logout } from "./actions";

// Tabs. `live` ones are real pages now; the rest show a quiet "soon" until we
// build them (Leads is Phase 1, then Chats, Traffic, Tasks).
const TABS: { href: string; label: string; live: boolean }[] = [
  { href: "/dashboard", label: "Overview", live: true },
  { href: "/dashboard/leads", label: "Leads", live: true },
  { href: "/dashboard/chats", label: "Chats", live: true },
  { href: "/dashboard/traffic", label: "Traffic", live: false },
  { href: "/dashboard/tasks", label: "Tasks", live: false },
];

// Everything under /dashboard is behind the password. requireAuth() sends
// guests to /login before any content renders.
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAuth();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-6">
      <header className="flex items-center justify-between border-b border-ink/10 pb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-forest">kaolin</span>
          <span className="text-sm text-muted">dashboard</span>
        </div>
        <form action={logout}>
          <button className="text-sm text-muted transition-colors hover:text-ink">
            Sign out
          </button>
        </form>
      </header>

      <nav className="flex flex-wrap items-center gap-1 py-4">
        {TABS.map((t) =>
          t.live ? (
            <Link
              key={t.href}
              href={t.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-forest/10"
            >
              {t.label}
            </Link>
          ) : (
            <span
              key={t.href}
              className="flex items-center gap-1 rounded-full px-4 py-2 text-sm text-muted/70"
            >
              {t.label}
              <span className="text-[0.65rem] uppercase tracking-wide text-muted/60">
                soon
              </span>
            </span>
          ),
        )}
        <a
          href="/admin"
          className="ml-auto rounded-full px-4 py-2 text-sm font-medium text-forest transition-colors hover:bg-forest/10"
        >
          Edit site text →
        </a>
      </nav>

      <main className="flex-1 py-4">{children}</main>
    </div>
  );
}
