import { PlayerBar } from "@/components/player/PlayerBar";
import { TrackHistory } from "@/components/player/TrackHistory";
import { ExternalPlayerLink } from "@/components/ui/ExternalPlayerLink";
import { getNowPlaying } from "@/lib/azuracast";

export const revalidate = 15;

export default async function HomePage() {
  const nowPlaying = await getNowPlaying();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-7xl sm:text-9xl text-white tracking-widest leading-none">
            NR1
          </h1>
          <p className="font-heading text-2xl sm:text-3xl text-nr1-cyan tracking-[0.4em] mt-1">
            DNB RADIO
          </p>
          <p className="font-mono text-xs text-nr1-muted mt-3 tracking-widest uppercase">
            Norwich · Drum &amp; Bass · 24/7
          </p>
        </div>

        {/* Player (mobile: pinned bar via CSS; desktop: inline hero) */}
        <PlayerBar />

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
