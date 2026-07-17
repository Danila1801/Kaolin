"use client";

import { useEffect, useRef } from "react";
import { sampleSky } from "@/components/scene/palette";

// Decides the sticky header's ink↔cream type by looking at the sky directly
// behind the bar and toggling [data-night] on the <header>. In WebGL mode that
// sky is exactly sampleSky(scrollProgress).top — the same value the field
// renders — so the header can never disagree with the background it sits on.
// (This replaces an old mix-blend-mode: difference trick, which was confined to
// the header's own transparent stacking context and so never actually inverted:
// the white wordmark simply vanished over the pale morning sky.)

// Rec. 709 relative luminance — enough to tell a light sky phase from night.
function skyTopLuminance(p: number): number {
  const [r, g, b] = sampleSky(p).top;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// WebGL2 decides which signal is trustworthy. With the field, the sky darkens on
// scroll progress; without it, BotanicalCanvas paints a light gradient and only
// the [data-scene-dark] act goes dark — so there we ask "is that act under the
// bar?" instead. Probed once; the probe context is released immediately.
let webgl2: boolean | null = null;
function hasWebgl2(): boolean {
  if (webgl2 === null) {
    try {
      const c = document.createElement("canvas").getContext("webgl2");
      webgl2 = !!c;
      c?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl2 = false;
    }
  }
  return webgl2;
}

export default function HeaderNightWatch() {
  // A hidden anchor so we can reach the real <header> without making the whole
  // (server-rendered, translated) header a client component.
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const header = ref.current?.closest<HTMLElement>(".site-header");
    if (!header) return;
    const webgl = hasWebgl2();
    let raf = 0;

    const measure = () => {
      raf = 0;
      let night: boolean;
      if (webgl) {
        const doc = document.documentElement;
        const max = Math.max(doc.scrollHeight - window.innerHeight, 1);
        const p = Math.min(Math.max(window.scrollY / max, 0), 1);
        night = skyTopLuminance(p) < 0.35;
      } else {
        // No field: the only dark surface is the [data-scene-dark] wrapper.
        const band = header.getBoundingClientRect().bottom;
        night = false;
        for (const el of document.querySelectorAll("[data-scene-dark]")) {
          const r = el.getBoundingClientRect();
          if (r.top <= band && r.bottom >= 0) {
            night = true;
            break;
          }
        }
      }
      header.toggleAttribute("data-night", night);
    };

    // rAF-coalesced: many scroll events collapse into one measurement per frame.
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <span ref={ref} className="hidden" aria-hidden="true" />;
}
