"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import FieldStage from "./FieldStage";
import { DPR_LADDER, initialDprLevel, type Density } from "./palette";

type Props = {
  wind: number;
  density: Density;
  grain: "on" | "off";
  reduced: boolean;
};

// The R3F stage. BotanicalCanvas mounts this with ssr:false, so window and
// document are safe everywhere below. Renderer settings mirror the raw
// version: opaque canvas, antialias, high-performance GPU preference.
export default function SceneRoot({ wind, density, grain, reduced }: Props) {
  const [dprLevel] = useState(initialDprLevel);

  return (
    <Canvas
      dpr={DPR_LADDER[dprLevel]}
      gl={{
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
      }}
      // fov is a placeholder: the world sets the real aspect-dependent value
      // on its first tick (portrait gets a wider field of view).
      camera={{ fov: 52.7, near: 0.1, far: 200, position: [0, 1.32, 4], rotation: [-0.16, 0, 0] }}
      frameloop={reduced ? "demand" : "always"}
      onCreated={({ gl }) => {
        // Ivory clear color: the one frame before the first draw must never
        // flash black (the sky wash covers everything from frame one on).
        gl.setClearColor("#f9f6f0", 1);
      }}
    >
      <FieldStage wind={wind} density={density} grain={grain} reduced={reduced} dprLevel={dprLevel} />
      {/* Future inhabitants (the cats) mount here as ordinary R3F children —
          <Suspense><Cat url="/models/….glb" /></Suspense> — sharing this
          camera and world scale (ground plane y=0, blades ~0.5–2 units tall).
          No restructuring needed: the grass uses raw shaders that ignore
          scene lights, so cat lighting won't disturb the field. */}
    </Canvas>
  );
}
