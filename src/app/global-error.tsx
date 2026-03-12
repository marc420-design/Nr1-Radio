"use client";

/**
 * Global error boundary for the entire app.
 * This catches errors in the root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: "#070709", color: "#fff", fontFamily: "system-ui" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ maxWidth: "28rem", width: "100%", textAlign: "center" }}>
            <h1 style={{ fontSize: "2rem", color: "#FF2D55", marginBottom: "1rem", letterSpacing: "0.1em" }}>
              CRITICAL ERROR
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#888", marginBottom: "2rem" }}>
              The application encountered a critical error. Please refresh the page.
            </p>
            {process.env.NODE_ENV === "development" && (
              <div style={{ textAlign: "left", border: "1px solid rgba(255, 45, 85, 0.2)", borderRadius: "0.5rem", backgroundColor: "rgba(255, 45, 85, 0.05)", padding: "1rem", marginBottom: "2rem" }}>
                <p style={{ fontSize: "0.75rem", color: "#FF2D55", wordBreak: "break-all" }}>
                  {error.message}
                </p>
              </div>
            )}
            <button
              onClick={reset}
              style={{ padding: "0.75rem 1.5rem", backgroundColor: "#00E5FF", color: "#070709", border: "none", borderRadius: "0.25rem", cursor: "pointer", fontSize: "0.875rem", letterSpacing: "0.1em", fontWeight: "bold" }}
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
