import type { ReactNode } from "react";

// Layout primitive every page section uses. It owns two things and nothing else:
// the max content width (1200px, centered) and the vertical/horizontal rhythm
// from the design system (sections 64→96→128px tall, gutters 24→48px).
// Keeping this in one place means no section can drift out of alignment.
export default function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      // scroll-mt keeps anchored sections clear of the sticky header.
      className={`mx-auto w-full max-w-[1320px] scroll-mt-24 px-6 py-20 sm:px-10 sm:py-28 lg:px-12 lg:py-36 ${className}`}
    >
      {children}
    </section>
  );
}
