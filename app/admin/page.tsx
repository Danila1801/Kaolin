"use client";

import { unstable_noStore as noStore } from "next/cache";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import config from "@/tina/config";

const TinaAdmin = dynamic(
  () => import("tinacms").then((mod) => (mod as any).TinaAdmin),
  { ssr: false }
) as unknown as ComponentType<{ config: unknown }>;

export default function AdminPage() {
  noStore();
  return <TinaAdmin config={config} />;
}
