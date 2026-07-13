"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";
import type { Density } from "./palette";

// three.js + R3F load only if this actually renders, and never on the server:
// SSR produces just the empty fixed wrapper below (same contract as the old
// web-component mount).
const SceneRoot = dynamic(() => import("./SceneRoot"), { ssr: false });

// WebGL2 support probed once per session, before paying for the three.js
// chunk. The probe context is released immediately so the real renderer never
// competes with it. null = not yet probed (server render / first paint).
let webgl2Support: boolean | null = null;
function getWebgl2Support(): boolean {
  if (webgl2Support === null) {
    try {
      const probe = document.createElement("canvas").getContext("webgl2");
      webgl2Support = !!probe;
      probe?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      webgl2Support = false;
    }
  }
  return webgl2Support;
}
const noSupportChange = () => () => {}; // support never changes mid-session

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getReduced = () => window.matchMedia(REDUCED_QUERY).matches;

type Props = {
  wind?: number;
  density?: Density;
  grain?: "on" | "off";
};

// Client-only mount for the botanical field (React Three Fiber). The scene is
// purely decorative: it sits behind all content (z-0, pointer-events none)
// and the page stays fully readable without it — the no-WebGL2 fallback
// paints a quiet gradient and darkens the [data-scene-dark] wrapper itself.
export default function BotanicalCanvas({
  wind = 1.6,
  density = "standard",
  grain = "on",
}: Props) {
  // useSyncExternalStore keeps SSR + hydration honest: the server snapshot
  // renders nothing (null/false), the client snapshot takes over after
  // hydration without a mismatch.
  const supported = useSyncExternalStore(noSupportChange, getWebgl2Support, () => null);
  const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => false);

  // Graceful fallback without WebGL2: sections inside [data-scene-dark] use
  // ivory text; with no canvas to darken behind them, paint the wrapper
  // itself. (Poll briefly — the sections may hydrate after this effect.)
  useEffect(() => {
    if (supported !== false) return;
    const paint = () => {
      const els = document.querySelectorAll<HTMLElement>("[data-scene-dark]");
      if (!els.length) return false;
      els.forEach((el) => {
        el.style.background = "#07100D";
      });
      return true;
    };
    if (paint()) return;
    let tries = 0;
    const iv = setInterval(() => {
      if (paint() || ++tries > 40) clearInterval(iv);
    }, 250);
    return () => clearInterval(iv);
  }, [supported]);

  return (
    <div
      aria-hidden="true"
      // translateZ(0) promotes the canvas to its own compositor layer. Without
      // it, some Intel/ANGLE setups keep displaying the canvas's initial black
      // frame (the layer is never invalidated) until the first user scroll.
      className="pointer-events-none fixed inset-0 z-0 will-change-transform [transform:translateZ(0)]"
      style={
        supported === false
          ? { background: "linear-gradient(180deg,#FAF8F3 0%,#F9F6F0 55%,#F1ECDF 100%)" }
          : undefined
      }
    >
      {supported === true && (
        <SceneRoot wind={wind} density={density} grain={grain} reduced={reduced} />
      )}
    </div>
  );
}
