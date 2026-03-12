import type { Metadata } from "next";
import { PlayerBar } from "@/components/player/PlayerBar";
import { DIRECT_STREAM_URL, SOCIAL_LINKS } from "@/lib/constants";

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

      {/* Browser player */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">IN YOUR BROWSER</h2>
        <div className="border border-nr1-cyan/20 rounded-lg bg-nr1-grey/40 p-6">
          <PlayerBar />
        </div>
      </section>

      {/* Alexa section */}
      <section className="space-y-6">
        <h2 className="font-heading text-2xl text-white tracking-widest">LISTEN ON ALEXA</h2>

        <p className="text-sm text-nr1-muted font-mono leading-relaxed">
          NR1 DNB is available on all Amazon Alexa devices. Once our station is listed on TuneIn,
          you can play it hands-free with a voice command.
        </p>

        {/* Primary voice phrase */}
        <div className="border border-nr1-cyan/40 rounded-lg bg-nr1-cyan/5 p-6 space-y-2">
          <p className="font-mono text-xs text-nr1-muted uppercase tracking-widest">Primary phrase</p>
          <p className="font-heading text-3xl sm:text-4xl text-nr1-cyan tracking-wide">
            "Alexa, play NR1 Drum and Bass Radio"
          </p>
        </div>

        {/* Fallback phrase */}
        <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-2">
          <p className="font-mono text-xs text-nr1-muted uppercase tracking-widest">Alternate phrase</p>
          <p className="font-heading text-2xl sm:text-3xl text-white/80 tracking-wide">
            "Alexa, play NR1 DNB"
          </p>
        </div>

        <p className="font-mono text-xs text-nr1-muted leading-relaxed">
          Tip: if Alexa doesn&apos;t recognise the station yet, try saying{" "}
          <span className="text-white">"Alexa, play NR1 Drum and Bass Radio on TuneIn"</span> to force
          a TuneIn lookup.
        </p>
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
            <p className="font-mono text-xs text-white/40 italic">Listing pending approval</p>
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
              <p className="font-mono text-xs text-white/60">Via TuneIn / RSK</p>
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

    </div>
  );
}
