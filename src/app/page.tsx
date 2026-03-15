import Image from "next/image";
import { PlayerBar } from "@/components/player/PlayerBar";
import { TrackHistory } from "@/components/player/TrackHistory";
import { ExternalPlayerLink } from "@/components/ui/ExternalPlayerLink";
import { getNowPlaying } from "@/lib/azuracast";
import { STAT_BADGES } from "@/lib/constants";

export const revalidate = 15;

export default async function HomePage() {
  const nowPlaying = await getNowPlaying();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8">

        {/* Logo block */}
        <div className="relative flex flex-col items-center text-center mb-8">
          {/* Radial cyan bloom behind logo */}
          <div className="hero-glow absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />

          <div className="relative flex justify-center mb-4 z-10">
            <Image
              src="/icons/icon-512.png"
              alt="NR1 DNB Radio"
              width={180}
              height={180}
              priority
              className="drop-shadow-[0_0_40px_rgba(0,229,255,0.3)]"
            />
          </div>

          <p className="relative z-10 font-heading text-2xl sm:text-3xl text-nr1-cyan tracking-[0.4em] mt-1">
            DNB RADIO
          </p>
          <p className="relative z-10 font-mono text-xs text-nr1-muted mt-2 tracking-widest uppercase">
            Norwich · Drum &amp; Bass · 24/7
          </p>

          {/* Stat badges */}
          <div className="relative z-10 flex flex-wrap justify-center gap-2 mt-4">
            {STAT_BADGES.map((badge) => (
              <span key={badge} className="stat-badge">{badge}</span>
            ))}
          </div>
        </div>

        {/* Desktop hero player — mobile uses the persistent StickyPlayer */}
        <div className="hidden lg:block w-full">
          <PlayerBar />
        </div>

        {/* External player link */}
        <div className="mt-4 lg:mt-2">
          <ExternalPlayerLink />
        </div>
      </section>

      {/* Track history — desktop only */}
      <section className="hidden lg:block max-w-2xl mx-auto w-full px-4 pb-12">
        <TrackHistory history={nowPlaying.song_history} />
      </section>
    </div>
  );
}
