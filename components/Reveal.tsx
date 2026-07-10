"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

// Opt-in scroll reveal: content fades up ~16px the first time it enters view,
// then never animates again. If the visitor asked their OS to reduce motion,
// we skip the animation entirely and render the content plainly — the reveal
// is decoration, never a gate on seeing the content.
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
