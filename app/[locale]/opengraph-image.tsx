import { ImageResponse } from "next/og";

// Branded Open Graph card. It lives inside the [locale] segment (not app root)
// so its URL is locale-prefixed — the i18n proxy would otherwise try to
// locale-redirect a bare /opengraph-image and 404 it. The card is identical
// across locales and stays in the Latin range on purpose: ImageResponse's
// built-in font carries no Cyrillic or ș/ț, so this keeps every locale legible
// rather than rendering tofu. The design leans on the brand palette.
export const alt = "kaolin — ai implementation studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The four locales are known at build time; generate the (identical) card for each.
export function generateStaticParams() {
  return ["en", "nl", "ro", "ru"].map((locale) => ({ locale }));
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F5E9D6",
          color: "#2B211A",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: "-0.02em" }}>
          kaolin
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 74,
              lineHeight: 1.05,
              maxWidth: 940,
              letterSpacing: "-0.02em",
            }}
          >
            ai that earns its place in your business.
          </div>
          <div style={{ fontSize: 30, color: "#71614f" }}>
            websites that think · amsterdam × chisinau
          </div>
        </div>
        <div style={{ height: 8, width: 140, background: "#a84c1a" }} />
      </div>
    ),
    { ...size },
  );
}
