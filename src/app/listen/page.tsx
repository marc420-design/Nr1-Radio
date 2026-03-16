import type { Metadata } from "next";
import { PlayerBar } from "@/components/player/PlayerBar";
import { DIRECT_STREAM_URL, SOCIAL_LINKS } from "@/lib/constants";
import { ListenerStats } from "@/components/listener/ListenerStats";
import { EmbedCodeSnippet } from "@/components/ui/EmbedCodeSnippet";
import { LiveChat } from "@/components/chat/LiveChat";

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

      {/* Live Chat */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">LIVE CHAT</h2>
        <p className="font-mono text-xs text-nr1-muted leading-relaxed">
          Chat with other listeners in real time. No sign-up needed.
        </p>
        <LiveChat />
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

          {/* Radio directories */}
          <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-2">
            <p className="font-heading text-lg text-nr1-cyan tracking-widest">RADIO APPS</p>
            <p className="font-mono text-xs text-nr1-muted leading-relaxed">
              Find us on MyTuner Radio, Online Radio Box, Streema, Radio Browser, and more — search "NR1 DNB Radio".
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
        <h2 className="font-heading text-2xl text-white tracking-widest">SMART SPEAKERS &amp; HARDWARE</h2>
        <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-6">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="space-y-1">
              <p className="font-heading text-xl text-nr1-cyan tracking-widest">AMAZON ALEXA</p>
              <p className="font-mono text-xs text-nr1-muted">Echo · Echo Dot · Fire TV</p>
              <p className="font-mono text-xs text-white/60">"Alexa, open nr one radio"</p>
            </div>
            <div className="space-y-1">
              <p className="font-heading text-xl text-nr1-cyan tracking-widest">INTERNET RADIOS</p>
              <p className="font-mono text-xs text-nr1-muted">Pure · Roberts · Yamaha · Denon</p>
              <p className="font-mono text-xs text-white/60">Via vTuner</p>
            </div>
            <div className="space-y-1">
              <p className="font-heading text-xl text-nr1-cyan tracking-widest">RADIO APPS</p>
              <p className="font-mono text-xs text-nr1-muted">MyTuner · Online Radio Box · Streema</p>
              <p className="font-mono text-xs text-white/60">Search "NR1 DNB Radio"</p>
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

      {/* Where to find us */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">FIND US ON</h2>
        <p className="font-mono text-xs text-nr1-muted leading-relaxed">
          NR1 DNB Radio is listed on all major internet radio directories — search "NR1 DNB Radio" on any of these platforms.
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-1">
            <p className="font-heading text-lg text-nr1-cyan tracking-widest">RADIO BROWSER</p>
            <p className="font-mono text-xs text-nr1-muted leading-relaxed">
              Open-source directory powering dozens of radio apps worldwide.
            </p>
            <p className="font-mono text-xs text-nr1-cyan/60">✅ Listed</p>
          </div>
          <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-1">
            <p className="font-heading text-lg text-nr1-cyan tracking-widest">MYTUNER</p>
            <p className="font-mono text-xs text-nr1-muted leading-relaxed">
              100,000+ stations, available on iOS, Android, and smart TVs.
            </p>
            <p className="font-mono text-xs text-nr1-cyan/60">✅ Listed</p>
          </div>
          <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-1">
            <p className="font-heading text-lg text-nr1-cyan tracking-widest">ONLINE RADIO BOX</p>
            <p className="font-mono text-xs text-nr1-muted leading-relaxed">
              Major global radio directory with iOS and Android apps.
            </p>
            <p className="font-mono text-xs text-nr1-cyan/60">✅ Listed</p>
          </div>
          <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-1">
            <p className="font-heading text-lg text-nr1-cyan tracking-widest">STREEMA</p>
            <p className="font-mono text-xs text-nr1-muted leading-relaxed">
              Popular radio discovery site used across Europe and the Americas.
            </p>
            <p className="font-mono text-xs text-nr1-cyan/60">✅ Listed</p>
          </div>
          <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-1">
            <p className="font-heading text-lg text-nr1-cyan tracking-widest">VTUNER</p>
            <p className="font-mono text-xs text-nr1-muted leading-relaxed">
              Powers built-in internet radio on Pure, Roberts, Yamaha, Denon, and Marantz hardware.
            </p>
            <p className="font-mono text-xs text-nr1-cyan/60">✅ Submitted</p>
          </div>
          <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-1">
            <p className="font-heading text-lg text-nr1-cyan tracking-widest">RADIO.NET</p>
            <p className="font-mono text-xs text-nr1-muted leading-relaxed">
              Europe's largest radio portal — millions of listeners across the continent.
            </p>
            <p className="font-mono text-xs text-nr1-cyan/60">✅ Submitted</p>
          </div>
        </div>
      </section>

    </div>
  );
}
