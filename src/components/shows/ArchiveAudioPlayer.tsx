"use client";
import { useState } from "react";
import { usePlayer } from "@/contexts/PlayerContext";

export function ArchiveAudioPlayer({ url, title }: { url: string; title: string }) {
  const { pause } = usePlayer();
  const [failed, setFailed] = useState(false);
  return <section className="rounded-xl border border-nr1-cyan/30 bg-nr1-grey/40 p-6 space-y-4" aria-label="Archive recording player">
    <h2 className="font-heading text-2xl text-white">Listen to this set</h2>
    <audio controls preload="none" src={url} aria-label={`Listen to ${title}`} onPlay={() => { pause(); setFailed(false); }} onError={() => setFailed(true)} className="w-full" />
    {failed && <p className="font-mono text-sm text-nr1-muted" role="alert">This recording is unavailable right now. Please try again later.</p>}
  </section>;
}
