"use client";

import { useState } from "react";

const EMBED_CODE = `<iframe src="https://listen.nr1dnb.com/embed" width="340" height="200"
  frameborder="0" allow="autoplay" title="NR1 DNB Radio"></iframe>`;

export function EmbedCodeSnippet() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(EMBED_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }

  return (
    <div className="border border-white/10 rounded-lg bg-nr1-grey/40 overflow-hidden">
      <pre className="p-4 font-mono text-xs text-nr1-muted leading-relaxed overflow-x-auto whitespace-pre-wrap break-all">
        {EMBED_CODE}
      </pre>
      <div className="border-t border-white/10 px-4 py-2 flex justify-end">
        <button
          onClick={handleCopy}
          className="font-mono text-xs text-nr1-muted hover:text-nr1-cyan transition-colors"
        >
          {copied ? "Copied!" : "Copy code"}
        </button>
      </div>
    </div>
  );
}
