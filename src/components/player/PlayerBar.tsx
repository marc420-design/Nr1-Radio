"use client";

import { usePlayer } from "@/contexts/PlayerContext";
import { PlayPauseButton } from "./PlayPauseButton";
import { NowPlayingCard } from "./NowPlayingCard";
import { LiveBadge } from "./LiveBadge";
import { VolumeControl } from "./VolumeControl";
import { EqualizerBars } from "./EqualizerBars";
import { ShareButton } from "@/components/ui/ShareButton";

/**
 * Desktop hero player card — shown inline on the homepage and listen page.
 * Audio state is shared via PlayerContext so navigating away doesn't kill the stream.
 * The persistent sticky bottom bar (StickyPlayer) is rendered in the root layout.
 */
export function PlayerBar() {
  const { play, pause, setVolume, toggleMute, isPlaying, isMuted, volume, status, track, artist, artwork, isLive, isOnline, listenerCount, uniqueListeners } = usePlayer();

  return (
    <div className="flex justify-center w-full">
      <div className="player-card flex flex-col items-center gap-6 py-10 px-12 w-full max-w-md">
        <div className="flex items-center gap-4">
          <LiveBadge isLive={isLive} isOnline={isOnline} status={status} />
          <EqualizerBars isPlaying={isPlaying} />
        </div>
        <PlayPauseButton isPlaying={isPlaying} status={status} onPlay={play} onPause={pause} />
        <NowPlayingCard track={track} artist={artist} artwork={artwork} />
        {listenerCount > 0 && (
          <p className="text-xs font-mono text-nr1-muted">
            {listenerCount} listening right now
            {uniqueListeners > listenerCount && ` • ${uniqueListeners} tuned in today`}
          </p>
        )}
        {track && artist && (
          <ShareButton
            title="NR1 DNB Radio"
            text={`Listening to ${artist} - ${track} on NR1 DNB Radio 🎵 listen.nr1dnb.com`}
            url="https://listen.nr1dnb.com"
            label="Share track"
          />
        )}
        <VolumeControl
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={setVolume}
          onToggleMute={toggleMute}
        />
      </div>
    </div>
  );
}
