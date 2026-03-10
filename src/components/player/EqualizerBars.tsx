"use client";

interface EqualizerBarsProps {
  isPlaying: boolean;
}

export function EqualizerBars({ isPlaying }: EqualizerBarsProps) {
  if (!isPlaying) return null;

  return (
    <div className="flex items-end gap-0.5 h-5" aria-hidden="true">
      <div className="eq-bar w-1 h-full bg-nr1-cyan rounded-sm" />
      <div className="eq-bar w-1 h-full bg-nr1-cyan rounded-sm" />
      <div className="eq-bar w-1 h-full bg-nr1-cyan rounded-sm" />
    </div>
  );
}
