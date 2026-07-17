import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { Density } from "./palette";
import { createWorld, type World } from "./world";

type Props = {
  wind: number;
  density: Density;
  grain: "on" | "off";
  reduced: boolean;
  dprLevel: number;
};

// The React⇄three.js seam. This component owns nothing visual itself: it
// creates the imperative world (world.ts) in an effect, feeds it one tick per
// frame, wires the DOM listeners the scene needs, and tears everything down
// on unmount. All mutation happens inside the world, outside React's render.
export default function FieldStage({ wind, density, grain, reduced, dprLevel }: Props) {
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  const worldRef = useRef<World | null>(null);
  const activated = useRef(false);

  // The dark act carries a solid dark backdrop by default so its ivory type is
  // legible before this field exists. Once the field has ticked a real frame we
  // flag <html>, which clears that backdrop to transparent (the night grass then
  // shows through). Removed on unmount so the act falls back to the safe dark.
  useEffect(() => {
    return () => {
      activated.current = false;
      delete document.documentElement.dataset.fieldActive;
    };
  }, []);

  useEffect(() => {
    const world = createWorld({
      density,
      grain: grain === "off" ? 0 : 1,
      initialDprLevel: dprLevel,
    });
    worldRef.current = world;
    scene.add(...world.objects);
    invalidate();
    return () => {
      worldRef.current = null;
      scene.remove(...world.objects);
      world.dispose();
    };
  }, [scene, invalidate, density, grain, dprLevel]);

  // Cursor position feeds the blade-parting uniform. Listeners live on window
  // because the canvas itself is pointer-events:none behind the page.
  useEffect(() => {
    const onMove = (e: PointerEvent) => worldRef.current?.pointerMove(e.clientX, e.clientY);
    const onLeave = () => worldRef.current?.pointerLeave();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Reduced motion runs the frameloop on demand only: repaint when the page
  // scrolls or becomes visible again — otherwise the field holds still.
  // (Resize repaints are already handled by R3F itself.)
  useEffect(() => {
    if (!reduced) return;
    const inv = () => invalidate();
    window.addEventListener("scroll", inv, { passive: true });
    document.addEventListener("visibilitychange", inv);
    invalidate();
    return () => {
      window.removeEventListener("scroll", inv);
      document.removeEventListener("visibilitychange", inv);
    };
  }, [reduced, invalidate]);

  useFrame((rs, delta) => {
    worldRef.current?.tick(rs, delta, wind, reduced);
    // First real frame: reveal the field behind the dark act (see the effect
    // above and .dark-act in globals.css).
    if (!activated.current) {
      activated.current = true;
      document.documentElement.dataset.fieldActive = "";
    }
  });

  return null;
}
