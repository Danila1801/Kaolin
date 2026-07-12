"use client";

import { useEffect, useRef } from "react";

type Props = {
  wind?: number;
  density?: "airy" | "standard" | "lush";
  grain?: "on" | "off";
};

// Client-only mount for the <botanical-scene> web component
// (lib/botanical-scene.js — raw WebGL2, no react-three-fiber dependency).
// The custom element registers itself on import, so this must never run on
// the server; SSR renders only the empty fixed wrapper. The scene is purely
// decorative: it sits behind all content (z-0, pointer-events none) and the
// page stays fully readable without it (no-WebGL fallback paints a quiet
// gradient and darkens the [data-scene-dark] wrapper itself).
export default function BotanicalScene({
  wind = 1.6,
  density = "standard",
  grain = "on",
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let el: HTMLElement | null = null;
    import("@/lib/botanical-scene.js").then(() => {
      if (cancelled || !hostRef.current) return;
      el = document.createElement("botanical-scene");
      el.setAttribute("wind", String(wind));
      el.setAttribute("density", density);
      el.setAttribute("grain", grain);
      hostRef.current.appendChild(el);
    });
    return () => {
      cancelled = true;
      el?.remove();
    };
  }, [wind, density, grain]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      // translateZ(0) promotes the canvas to its own compositor layer. Without
      // it, some Intel/ANGLE setups keep displaying the canvas's initial black
      // frame (the layer is never invalidated) until the first user scroll.
      className="pointer-events-none fixed inset-0 z-0 will-change-transform [transform:translateZ(0)]"
    />
  );
}
