import type { ReactNode } from "react";
import type { Metadata } from "next";
// Load the site's design tokens (colors like bg-cream / text-forest live here)
// so the admin matches the brand. app/(dash)/layout.tsx -> app/globals.css
import "../globals.css";

// The admin must never be indexed by search engines.
export const metadata: Metadata = {
  title: "kaolin dashboard",
  robots: { index: false, follow: false },
};

// The (dash) route group has no URL segment: pages inside still live at /login
// and /dashboard. This layout is the <html> root for those routes (the public
// site has its own root in app/[locale]/layout.tsx). It is intentionally public
// so the login page can render; the lock lives in dashboard/layout.tsx.
export default function DashRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream text-ink antialiased [font-family:system-ui,-apple-system,'Segoe_UI',Roboto,sans-serif]">
        {children}
      </body>
    </html>
  );
}
