import Image from "next/image";
import { PlayerBar } from "@/components/player/PlayerBar";
import { TrackHistory } from "@/components/player/TrackHistory";
import { ExternalPlayerLink } from "@/components/ui/ExternalPlayerLink";
import { ListenerStats } from "@/components/listener/ListenerStats";
import { NextShowBanner } from "@/components/schedule/NextShowBanner";
import { getNowPlaying } from "@/lib/azuracast";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { ScheduleRow } from "@/lib/supabase";
import { STAT_BADGES } from "@/lib/constants";

export const revalidate = 15;

export default async function HomePage() {
  const [nowPlaying, schedule] = await Promise.all([
    getNowPlaying(),
    (async () => {
      try {
        const supabase = getSupabaseServerClient();
        const { data } = await supabase
          .from("schedule")
          .select("*")
          .order("day_of_week")
          .order("start_time");
        return (data as ScheduleRow[]) ?? [];
      } catch {
        return [];
      }
    })(),
  ]);

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
              className="w-[120px] h-[120px] sm:w-[180px] sm:h-[180px] drop-shadow-[0_0_40px_rgba(0,229,255,0.3)]"
            />
          </div>

          <h1 className="relative z-10 font-heading text-xl sm:text-3xl text-nr1-cyan tracking-[0.4em] mt-1">
            DNB RADIO
          </h1>
          <p className="relative z-10 font-mono text-xs text-nr1-muted mt-2 tracking-widest uppercase">
            Norwich · Drum &amp; Bass · 24/7
          </p>

          {/* Stat badges */}
          <div className="relative z-10 flex flex-wrap justify-center gap-2 mt-4">
            {STAT_BADGES.map((badge) => (
              <span key={badge} className="stat-badge">{badge}</span>
            ))}
          </div>

          {/* Listen Live CTA */}
          <a
            href="/listen"
            className="relative z-10 mt-6 inline-flex items-center gap-2 px-8 py-3 bg-nr1-cyan text-nr1-black font-heading text-lg tracking-widest rounded hover:bg-nr1-cyan/90 transition-colors"
          >
            <span className="animate-pulse">●</span> LISTEN LIVE
          </a>
        </div>

        {/* Hero player */}
        <div className="w-full">
          <PlayerBar />
        </div>

        {/* External player link */}
        <div className="mt-4 lg:mt-2">
          <ExternalPlayerLink />
        </div>

        {/* Next show countdown */}
        {schedule.length > 0 && (
          <div className="mt-6 w-full max-w-md">
            <NextShowBanner schedule={schedule} />
          </div>
        )}
      </section>

      {/* Track history + listener stats */}
      <section className="max-w-2xl mx-auto w-full px-4 pb-12 space-y-6">
        <TrackHistory history={nowPlaying.song_history} />
        <ListenerStats />
      </section>
    </div>
  );
}
