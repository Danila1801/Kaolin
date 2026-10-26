// Tina's admin lives outside (dash) and [locale], so it needs its own root layout.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
