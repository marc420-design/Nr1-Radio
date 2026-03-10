"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <h1 className="font-heading text-7xl text-white tracking-widest">NR1</h1>
        <div className="w-16 h-px bg-nr1-cyan mx-auto" />
        <h2 className="font-heading text-3xl text-nr1-muted tracking-wide">You&apos;re Offline</h2>
        <p className="font-mono text-sm text-nr1-muted max-w-sm">
          Check your internet connection and try again. The stream will resume automatically
          once you&apos;re back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-lg bg-nr1-grey border border-white/10 font-mono text-sm text-nr1-cyan hover:border-nr1-cyan/30 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
