import type { Metadata } from "next";
import { PlayerBar } from "@/components/player/PlayerBar";
import { DIRECT_STREAM_URL, SOCIAL_LINKS } from "@/lib/constants";
import { ListenerStats } from "@/components/listener/ListenerStats";
import { EmbedCodeSnippet } from "@/components/ui/EmbedCodeSnippet";

export const metadata: Metadata = {
  title: "Listen — NR1 DNB Radio",
  description: "Listen live to NR1 DNB Radio on Alexa, TuneIn, or in your browser. Norwich's finest drum & bass station.",
};

export default function ListenPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-16">

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="font-heading text-5xl sm:text-6xl text-nr1-cyan tracking-widest">
          LISTEN LIVE
        </h1>
        <p className="font-mono text-sm text-nr1-muted tracking-widest uppercase">
          NR1 Drum &amp; Bass Radio · Norwich, UK · 24/7
        </p>
      </div>

      {/* Browser player — desktop only; mobile uses the persistent StickyPlayer */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">IN YOUR BROWSER</h2>
        <div className="hidden lg:block border border-nr1-cyan/20 rounded-lg bg-nr1-grey/40 p-6">
          <PlayerBar />
        </div>
        <p className="lg:hidden font-mono text-xs text-nr1-muted">
          Use the player bar at the bottom of your screen to listen live.
        </p>
        <ListenerStats />
      </section>

      {/* Alexa section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="font-heading text-2xl text-white tracking-widest">LISTEN ON ALEXA</h2>
          <span className="px-2 py-1 bg-nr1-cyan/20 border border-nr1-cyan/40 rounded text-xs font-mono text-nr1-cyan uppercase tracking-wider">
            LIVE NOW
          </span>
        </div>

        <p className="text-sm text-nr1-muted font-mono leading-relaxed">
          NR1 Radio is now available on all Amazon Alexa devices! Just use your voice to start listening instantly.
        </p>

        {/* Primary voice phrase - Custom Skill */}
        <div className="border-2 border-nr1-cyan/60 rounded-lg bg-nr1-cyan/10 p-6 space-y-3">
          <p className="font-mono text-xs text-nr1-cyan uppercase tracking-widest">Custom Skill</p>
          <p className="font-heading text-3xl sm:text-4xl text-nr1-cyan tracking-wide">
            "Alexa, open nr one radio"
          </p>
          <p className="font-mono text-xs text-nr1-muted">
            ✅ Works immediately on your devices<br/>
            ✅ Simple voice command<br/>
            ✅ High quality 320 kbps streaming
          </p>
        </div>

        {/* TuneIn - Live */}
        <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-2">
          <p className="font-mono text-xs text-nr1-muted uppercase tracking-widest">Via TuneIn</p>
          <p className="font-heading text-2xl sm:text-3xl text-white tracking-wide">
            "Alexa, play NR1 Drum and Bass Radio"
          </p>
        </div>

        {/* How it works */}
        <div className="border border-white/5 rounded-lg bg-nr1-grey/20 p-5 space-y-3">
          <p className="font-mono text-xs text-nr1-cyan uppercase tracking-widest">How to use</p>
          <div className="space-y-2 font-mono text-xs text-nr1-muted leading-relaxed">
            <p>1. Say: <span className="text-white">"Alexa, open nr one radio"</span></p>
            <p>2. Stream starts automatically</p>
            <p>3. Control with: "pause", "resume", "stop"</p>
          </div>
          <p className="font-mono text-xs text-white/40 pt-2">
            Works on Echo, Echo Dot, Echo Show, Echo Studio, Fire TV, and Alexa app
          </p>
        </div>
      </section>

      {/* Other ways to listen */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">OTHER WAYS TO LISTEN</h2>

        <div className="grid sm:grid-cols-2 gap-4">

          {/* TuneIn */}
          <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-2">
            <p className="font-heading text-lg text-nr1-cyan tracking-widest">TUNEIN</p>
            <p className="font-mono text-xs text-nr1-muted leading-relaxed">
              Available on TuneIn — works on Alexa, Google Home, Sonos, Bose, and the TuneIn app.
            </p>
          </div>

          {/* Direct stream */}
          <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-2">
            <p className="font-heading text-lg text-nr1-cyan tracking-widest">DIRECT STREAM</p>
            <p className="font-mono text-xs text-nr1-muted leading-relaxed">
              Copy the stream URL into any media player — VLC, foobar2000, Winamp, etc.
            </p>
            <a
              href={DIRECT_STREAM_URL}
              className="inline-block font-mono text-xs text-nr1-cyan break-all hover:underline"
            >
              {DIRECT_STREAM_URL}
            </a>
          </div>

          {/* Mixcloud */}
          <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-2">
            <p className="font-heading text-lg text-nr1-cyan tracking-widest">MIXCLOUD</p>
            <p className="font-mono text-xs text-nr1-muted leading-relaxed">
              Catch up on recorded sets from our resident DJs.
            </p>
            <a
              href={SOCIAL_LINKS.mixcloud}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-mono text-xs text-nr1-cyan hover:underline"
            >
              mixcloud.com/Nr1family
            </a>
          </div>

          {/* YouTube */}
          <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-2">
            <p className="font-heading text-lg text-nr1-cyan tracking-widest">YOUTUBE</p>
            <p className="font-mono text-xs text-nr1-muted leading-relaxed">
              Full set archives and live Friday session recordings.
            </p>
            <a
              href={SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-mono text-xs text-nr1-cyan hover:underline"
            >
              youtube.com/@nr1family420
            </a>
          </div>
        </div>
      </section>

      {/* Smart speakers section */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">SMART SPEAKERS</h2>
        <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-6">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <p className="font-heading text-xl text-nr1-cyan tracking-widest">AMAZON ALEXA</p>
              <p className="font-mono text-xs text-nr1-muted">Echo · Echo Dot · Fire TV</p>
              <p className="font-mono text-xs text-white/60">Via TuneIn</p>
            </div>
            <div className="space-y-1">
              <p className="font-heading text-xl text-nr1-cyan tracking-widest">GOOGLE HOME</p>
              <p className="font-mono text-xs text-nr1-muted">Nest · Hub · Mini</p>
              <p className="font-mono text-xs text-white/60">Via TuneIn</p>
            </div>
            <div className="space-y-1">
              <p className="font-heading text-xl text-nr1-cyan tracking-widest">SONOS / BOSE</p>
              <p className="font-mono text-xs text-nr1-muted">All Sonos & Bose devices</p>
              <p className="font-mono text-xs text-white/60">Via TuneIn</p>
            </div>
          </div>
        </div>
      </section>

      {/* Friday sessions callout */}
      <section className="border border-nr1-crimson/30 rounded-lg bg-nr1-crimson/5 p-6 space-y-3">
        <p className="font-heading text-2xl text-nr1-crimson tracking-widest">LIVE FRIDAYS</p>
        <p className="font-mono text-sm text-white/70 leading-relaxed">
          Every Friday — live DJ sets streamed direct. Tune in on Alexa, TuneIn, or right here in
          your browser. Follow us on Facebook for session announcements.
        </p>
        <a
          href={SOCIAL_LINKS.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-mono text-xs text-nr1-crimson hover:underline"
        >
          facebook.com/nr1dnb →
        </a>
      </section>

      {/* Embed the player */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">EMBED THE PLAYER</h2>
        <p className="font-mono text-xs text-nr1-muted leading-relaxed">
          DJ or promoter? Drop our player on your website.
        </p>
        <EmbedCodeSnippet />
      </section>

      {/* Get listed */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">GET LISTED</h2>
        <p className="font-mono text-xs text-nr1-muted leading-relaxed">
          Submit NR1 DNB Radio to these directories. Use the stream URL below when prompted.
        </p>
        <div className="border border-white/10 rounded-lg bg-nr1-grey/20 px-4 py-3">
          <p className="font-mono text-xs text-nr1-muted mb-1">Stream URL</p>
          <p className="font-mono text-xs text-nr1-cyan break-all">{DIRECT_STREAM_URL}</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <a
            href="https://tunein.com/stations/submit/"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-1 hover:border-nr1-cyan/40 transition-colors"
          >
            <p className="font-heading text-lg text-nr1-cyan tracking-widest">TUNEIN</p>
            <p className="font-mono text-xs text-nr1-muted leading-relaxed">
              Submit your station to TuneIn for Alexa, Sonos, and app listeners.
            </p>
            <p className="font-mono text-xs text-white/40">tunein.com →</p>
          </a>
          <a
            href="https://www.radio.net/info/stationinfo"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-1 hover:border-nr1-cyan/40 transition-colors"
          >
            <p className="font-heading text-lg text-nr1-cyan tracking-widest">RADIO.NET</p>
            <p className="font-mono text-xs text-nr1-muted leading-relaxed">
              Reach millions of listeners across Europe and beyond.
            </p>
            <p className="font-mono text-xs text-white/40">radio.net →</p>
          </a>
          <a
            href="https://www.internet-radio.com/submit/"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-1 hover:border-nr1-cyan/40 transition-colors"
          >
            <p className="font-heading text-lg text-nr1-cyan tracking-widest">INTERNET-RADIO</p>
            <p className="font-mono text-xs text-nr1-muted leading-relaxed">
              One of the largest internet radio directories worldwide.
            </p>
            <p className="font-mono text-xs text-white/40">internet-radio.com →</p>
          </a>
        </div>
      </section>

    </div>
  );
}
