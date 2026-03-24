"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "nr1-pwa-banner-dismissed";

export function PwaInstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Don't show if user already dismissed or app is already installed
    if (
      localStorage.getItem(DISMISS_KEY) ||
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="flex items-center gap-3 bg-nr1-grey border border-nr1-cyan/30 rounded-xl px-4 py-3 shadow-lg">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-nr1-cyan/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-nr1-cyan" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono text-white leading-tight">Add NR1 Radio to your home screen</p>
            <p className="text-xs font-mono text-nr1-muted leading-tight">One tap to listen, works offline</p>
          </div>
          <button
            onClick={handleInstall}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-nr1-cyan text-nr1-black text-xs font-mono font-bold hover:opacity-90 transition-opacity"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="shrink-0 text-nr1-muted hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
