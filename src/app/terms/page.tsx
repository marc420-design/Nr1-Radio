import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — NR1 DNB Radio",
  description: "Terms of use for NR1 DNB Radio and the NR1 DNB Radio Alexa skill.",
  alternates: {
    canonical: "https://listen-nr1dnb.com/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <h1 className="font-heading text-4xl text-nr1-cyan tracking-widest">TERMS OF USE</h1>
      <p className="font-mono text-xs text-nr1-muted">Last updated: July 2026</p>
      <div className="space-y-6 font-mono text-sm text-white/70 leading-relaxed">

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">USE OF SERVICE</h2>
          <p>
            NR1 DNB Radio (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is operated as a
            trading name from Norwich, UK. We provide a free live internet radio streaming service at
            listen-nr1dnb.com and via the NR1 DNB Radio Alexa skill. By using our service you agree
            to these terms. These terms are governed by the laws of England and Wales.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">PERMITTED USE</h2>
          <p>
            The NR1 DNB Radio stream is provided for personal, non-commercial listening only. You may
            not rebroadcast, redistribute, record, or republish our stream or any content from it
            without prior written permission from NR1 DNB Radio.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">COPYRIGHT</h2>
          <p>
            All broadcast content — including DJ sets, MC performances, live shows, and recordings —
            is copyright &copy; NR1 DNB Radio and/or the respective rights holders. Music broadcast
            on this station may be protected by copyright. Unauthorised copying, distribution, or
            commercial exploitation of broadcast content is prohibited.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">MUSIC LICENSING</h2>
          <p>
            NR1 DNB Radio operates under licences from PPL and PRS for Music covering the broadcast
            of music recordings and compositions respectively. These licences cover our internet radio
            stream at listen-nr1dnb.com.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">LIVE CHAT</h2>
          <p>
            Our live chat is a public forum. You are responsible for any content you post. We reserve
            the right to remove messages that are offensive, illegal, or otherwise inappropriate. Do
            not post personal information about yourself or others in the chat.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">ALEXA SKILL</h2>
          <p>
            The NR1 DNB Radio Alexa skill is a free service. It streams our live radio station and is
            subject to Amazon&apos;s Alexa Terms of Use in addition to these terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">AVAILABILITY</h2>
          <p>
            We aim to keep the service running 24/7 but cannot guarantee uninterrupted availability.
            We reserve the right to modify or discontinue the service at any time without notice. We
            accept no liability for any loss or inconvenience caused by interruption to the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">CONTACT</h2>
          <p>
            NR1 DNB Radio, Norwich, UK<br />
            Email:{" "}
            <a href="mailto:nr1family420@gmail.com" className="text-nr1-cyan hover:underline">
              nr1family420@gmail.com
            </a>
          </p>
        </section>

      </div>
    </div>
  );
}
