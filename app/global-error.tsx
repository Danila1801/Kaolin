"use client";

// Last-resort boundary for errors thrown in the root layout itself. It replaces
// the whole document, so it renders its own <html>/<body> and uses inline styles
// in the brand palette — the app's CSS may not have loaded at this point, and
// there may be no locale context, so the copy is English only by design.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f5e9d6",
          color: "#2b211a",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <main style={{ maxWidth: 480, padding: 24 }}>
          <h1 style={{ fontSize: 32, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#71614f", margin: "0 0 24px", lineHeight: 1.6 }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#a84c1a",
              color: "#f5e9d6",
              border: "none",
              borderRadius: 9999,
              padding: "12px 24px",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
