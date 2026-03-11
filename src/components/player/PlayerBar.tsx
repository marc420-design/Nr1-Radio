"use client";

import { useAudioStream } from "@/hooks/useAudioStream";
import { useNowPlaying } from "@/hooks/useNowPlaying";
import { useMediaSession } from "@/hooks/useMediaSession";
import { PlayPauseButton } from "./PlayPauseButton";
import { NowPlayingCard } from "./NowPlayingCard";
import { LiveBadge } from "./LiveBadge";
import { VolumeControl } from "./VolumeControl";
import { EqualizerBars } from "./EqualizerBars";

export function PlayerBar() {
  const { play, pause, setVolume, toggleMute, isPlaying, isMuted, volume, status } = useAudioStream();
  const { track, artist, artwork, isLive, isOnline } = useNowPlaying();

  useMediaSession({ track, artist, artwork, isPlaying, onPlay: play, onPause: pause });

  return (
    <>
      {/* Mobile: fixed bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-nr1-grey/95 backdrop-blur-md border-t border-nr1-cyan/20 mobile-bar-glow px-4 py-3">
        <div className="flex items-center gap-3">
          <PlayPauseButton isPlaying={isPlaying} status={status} onPlay={play} onPause={pause} />
          <div className="flex-1 min-w-0">
            <NowPlayingCard track={track} artist={artist} artwork={artwork} />
          </div>
          <div className="flex flex-col items-end gap-1">
            <LiveBadge isLive={isLive} isOnline={isOnline} status={status} />
            <EqualizerBars isPlaying={isPlaying} />
          </div>
        </div>
      </div>

      {/* Desktop: hero section (rendered inline, not fixed) */}
      <div className="hidden lg:flex justify-center w-full">
        <div className="player-card flex flex-col items-center gap-6 py-10 px-12 w-full max-w-md">
          <div className="flex items-center gap-4">
            <LiveBadge isLive={isLive} isOnline={isOnline} status={status} />
            <EqualizerBars isPlaying={isPlaying} />
          </div>
          <PlayPauseButton isPlaying={isPlaying} status={status} onPlay={play} onPause={pause} />
          <NowPlayingCard track={track} artist={artist} artwork={artwork} />
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
          />
        </div>
      </div>
    </>
  );
}
