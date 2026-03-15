import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — NR1 DNB Radio",
  description: "Privacy policy for NR1 DNB Radio and the NR1 DNB Radio Alexa skill.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <h1 className="font-heading text-4xl text-nr1-cyan tracking-widest">PRIVACY POLICY</h1>
      <p className="font-mono text-xs text-nr1-muted">Last updated: March 2026</p>
      <div className="space-y-6 font-mono text-sm text-white/70 leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">OVERVIEW</h2>
          <p>NR1 DNB Radio operates the NR1 DNB Radio website at listen.nr1dnb.com and the NR1 DNB Radio Alexa skill. This policy explains how we handle information.</p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">DATA WE COLLECT</h2>
          <p>We do not collect, store, or share any personal information from users of our Alexa skill or website. The Alexa skill streams live radio audio only and does not require account registration or personal data of any kind.</p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">ALEXA SKILL</h2>
          <p>The NR1 DNB Radio Alexa skill streams live audio from our radio server. No user data is transmitted to NR1 DNB Radio servers during skill usage. Audio playback is handled entirely by Amazon&apos;s Alexa platform.</p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">THIRD PARTIES</h2>
          <p>Our stream is hosted by AzuraCast. Anonymous listener count statistics may be collected by our stream host. We do not sell or share any data with third parties for marketing purposes.</p>
        </section>
        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">CONTACT</h2>
          <p>For any privacy questions, contact us via our <a href="https://www.facebook.com/nr1dnb" target="_blank" rel="noopener noreferrer" className="text-nr1-cyan hover:underline">Facebook page</a>.</p>
        </section>
      </div>
    </div>
  );
}
