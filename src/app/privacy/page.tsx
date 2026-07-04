import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — NR1 DNB Radio",
  description: "Privacy policy for NR1 DNB Radio and the NR1 DNB Radio Alexa skill.",
  alternates: {
    canonical: "https://listen-nr1dnb.com/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <h1 className="font-heading text-4xl text-nr1-cyan tracking-widest">PRIVACY POLICY</h1>
      <p className="font-mono text-xs text-nr1-muted">Last updated: July 2026</p>
      <div className="space-y-6 font-mono text-sm text-white/70 leading-relaxed">

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">OVERVIEW</h2>
          <p>
            NR1 DNB Radio (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates the website at listen-nr1dnb.com
            and the NR1 DNB Radio Alexa skill. We are based in Norwich, UK. This policy explains what
            data we collect, how we use it, and your rights under the UK General Data Protection
            Regulation (UK GDPR) and the Data Protection Act 2018.
          </p>
          <p>
            Data controller: NR1 DNB Radio, Norwich, UK.
            Contact: <a href="mailto:nr1family420@gmail.com" className="text-nr1-cyan hover:underline">nr1family420@gmail.com</a>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">DATA WE COLLECT</h2>
          <p>We collect and process the following data:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>
              <span className="text-white">Live chat messages</span> — when you use the live chat on our
              /listen page, your chosen username and message are stored in our database. No account or
              email address is required. Messages are automatically deleted on a rolling basis; only
              the most recent 500 messages are retained at any time.
            </li>
            <li>
              <span className="text-white">Anonymous analytics</span> — we use Umami Analytics, a
              privacy-focused tool, to count page views and understand how our site is used. Umami does
              not use cookies and does not collect personally identifiable information. No data is
              shared with advertising networks.
            </li>
            <li>
              <span className="text-white">Listener statistics</span> — our stream host AzuraCast
              collects anonymous listener counts and approximate geographic location (country/city
              level) for broadcast reporting purposes. Individual IP addresses are not stored by us.
            </li>
            <li>
              <span className="text-white">Broadcast logs</span> — we maintain logs of tracks played
              on our station for compliance with our PPL and PRS for Music broadcast licences. These
              logs contain track metadata (artist, title) and play timestamps only — no listener data.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">LEGAL BASIS</h2>
          <p>
            We process chat messages on the basis of your consent (you choose to post). We process
            analytics and broadcast logs on the basis of our legitimate interests in operating a
            lawful internet radio service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">ALEXA SKILL</h2>
          <p>
            The NR1 DNB Radio Alexa skill streams live audio from our radio server. No user data is
            transmitted to NR1 DNB Radio during skill usage. Audio playback is handled entirely by
            Amazon&apos;s Alexa platform, subject to Amazon&apos;s own privacy policy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">THIRD PARTIES</h2>
          <p>We use the following third-party services:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><span className="text-white">AzuraCast</span> — stream hosting and listener statistics</li>
            <li><span className="text-white">Supabase</span> — database for chat messages and show data (hosted in EU)</li>
            <li><span className="text-white">Umami Analytics</span> — privacy-first analytics, no cookies</li>
            <li><span className="text-white">Vercel</span> — website hosting</li>
          </ul>
          <p>We do not sell or share personal data with third parties for marketing purposes.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">YOUR RIGHTS</h2>
          <p>
            Under UK GDPR you have the right to access, correct, or request deletion of any personal
            data we hold about you. Because chat messages are not linked to an identity, we cannot
            retrieve them by user. To exercise your rights or ask any questions, contact us at{" "}
            <a href="mailto:nr1family420@gmail.com" className="text-nr1-cyan hover:underline">nr1family420@gmail.com</a>.
          </p>
          <p>
            You have the right to lodge a complaint with the UK Information Commissioner&apos;s Office
            (ICO) at <span className="text-white">ico.org.uk</span>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-heading text-lg text-white tracking-widest">CONTACT</h2>
          <p>
            NR1 DNB Radio, Norwich, UK<br />
            Email: <a href="mailto:nr1family420@gmail.com" className="text-nr1-cyan hover:underline">nr1family420@gmail.com</a>
          </p>
        </section>

      </div>
    </div>
  );
}
