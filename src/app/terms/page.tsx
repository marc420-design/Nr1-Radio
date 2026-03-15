import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use — NR1 DNB Radio",
  description: "Terms of use for NR1 DNB Radio and the NR1 DNB Radio Alexa skill.",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <h1 className="font-heading text-4xl text-nr1-cyan tracking-widest">TERMS OF USE</h1>
      <p className="font-mono text-xs text-nr1-muted">Last updated: March 2026</p>
      <div className="space-y-6 font-mono text-sm text-white/70 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">USE OF SERVICE</h2>
          <p>NR1 DNB Radio provides a free live internet radio streaming service available via our website at listen.nr1dnb.com and via the NR1 DNB Radio Alexa skill. By using our service you agree to these terms.</p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">PERMITTED USE</h2>
          <p>The NR1 DNB Radio stream is provided for personal, non-commercial listening only. You may not rebroadcast, redistribute, or republish our stream without prior written permission.</p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">ALEXA SKILL</h2>
          <p>The NR1 DNB Radio Alexa skill is a free service. It streams our live radio station and is subject to Amazon&apos;s Alexa Terms of Use in addition to these terms.</p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">AVAILABILITY</h2>
          <p>We aim to keep the service running 24/7 but cannot guarantee uninterrupted availability. We reserve the right to modify or discontinue the service at any time.</p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">CONTACT</h2>
          <p>For any queries, contact us via our <a href="https://www.facebook.com/nr1dnb" target="_blank" rel="noopener noreferrer" className="text-nr1-cyan hover:underline">Facebook page</a>.</p>
        </section>
      </div>
    </div>
  );
}
