"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("App error:", error);
    }
    // In production, you could send this to an error tracking service
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl text-nr1-crimson tracking-widest">
            SOMETHING WENT WRONG
          </h1>
          <p className="font-mono text-sm text-nr1-muted">
            We encountered an unexpected error. Please try again.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="text-left border border-nr1-crimson/20 rounded-lg bg-nr1-crimson/5 p-4">
            <p className="font-mono text-xs text-nr1-crimson break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="font-mono text-xs text-nr1-muted mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-nr1-cyan text-nr1-black font-heading text-sm tracking-widest hover:bg-nr1-cyan/90 transition-colors rounded"
          >
            TRY AGAIN
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-nr1-cyan/40 text-nr1-cyan font-heading text-sm tracking-widest hover:bg-nr1-cyan/10 transition-colors rounded"
          >
            GO HOME
          </a>
        </div>
      </div>
    </div>
  );
}
