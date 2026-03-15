import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — NR1 DNB Radio",
  description: "Privacy policy for NR1 DNB Radio website and Alexa skill.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="font-heading text-4xl sm:text-5xl text-nr1-cyan tracking-widest">
          PRIVACY POLICY
        </h1>
        <p className="font-mono text-xs text-nr1-muted uppercase tracking-widest">
          Last Updated: March 12, 2026
        </p>
      </div>

      {/* Introduction */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">INTRODUCTION</h2>
        <p className="font-mono text-sm text-nr1-muted leading-relaxed">
          NR1 Radio ("we", "our", "us") operates the website{" "}
          <a href="https://listen-nr1dnb.com" className="text-nr1-cyan hover:underline">
            https://listen-nr1dnb.com
          </a>{" "}
          and the NR1 Radio Alexa skill. This privacy policy explains how we handle information 
          when you use our services.
        </p>
      </section>

      {/* Information We Collect */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">INFORMATION WE COLLECT</h2>
        
        <div className="space-y-6">
          <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-2">
            <h3 className="font-heading text-lg text-nr1-cyan tracking-widest">WEBSITE</h3>
            <ul className="font-mono text-sm text-nr1-muted leading-relaxed space-y-2 list-disc list-inside">
              <li>We do not collect personal information through our website</li>
              <li>We use Umami Analytics (privacy-focused, no cookies)</li>
              <li>Basic usage statistics only (page views, referrers)</li>
              <li>No personally identifiable information is stored</li>
            </ul>
          </div>

          <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-2">
            <h3 className="font-heading text-lg text-nr1-cyan tracking-widest">ALEXA SKILL</h3>
            <ul className="font-mono text-sm text-nr1-muted leading-relaxed space-y-2 list-disc list-inside">
              <li>We do not collect, store, or process any personal information</li>
              <li>No user data is retained by our skill</li>
              <li>Amazon may collect standard Alexa usage data (see Amazon&apos;s privacy policy)</li>
              <li>We only stream audio content - no data collection</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How We Use Information */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">HOW WE USE INFORMATION</h2>
        <p className="font-mono text-sm text-nr1-muted leading-relaxed">
          We use anonymous analytics data to:
        </p>
        <ul className="font-mono text-sm text-nr1-muted leading-relaxed space-y-2 list-disc list-inside ml-4">
          <li>Understand how many people visit our site</li>
          <li>Improve our website and streaming service</li>
          <li>Monitor technical performance</li>
        </ul>
        <p className="font-mono text-sm text-white leading-relaxed pt-4">
          We do NOT:
        </p>
        <ul className="font-mono text-sm text-nr1-muted leading-relaxed space-y-2 list-disc list-inside ml-4">
          <li>Sell or share any data</li>
          <li>Use cookies or tracking</li>
          <li>Store personal information</li>
          <li>Profile users</li>
        </ul>
      </section>

      {/* Third-Party Services */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">THIRD-PARTY SERVICES</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-mono text-sm text-nr1-cyan uppercase tracking-widest mb-2">Streaming</h3>
            <p className="font-mono text-sm text-nr1-muted leading-relaxed">
              Our audio stream is hosted by our streaming provider. They may collect basic connection 
              data (IP addresses for streaming). This data is not shared with us.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-sm text-nr1-cyan uppercase tracking-widest mb-2">Amazon Alexa</h3>
            <p className="font-mono text-sm text-nr1-muted leading-relaxed">
              When you use our Alexa skill, Amazon processes your voice commands. 
              See Amazon&apos;s privacy policy:{" "}
              <a href="https://www.amazon.com/privacy" target="_blank" rel="noopener noreferrer" className="text-nr1-cyan hover:underline">
                amazon.com/privacy
              </a>
              . We do not receive any personal information from Amazon.
            </p>
          </div>

          <div>
            <h3 className="font-mono text-sm text-nr1-cyan uppercase tracking-widest mb-2">Analytics</h3>
            <p className="font-mono text-sm text-nr1-muted leading-relaxed">
              We use Umami Analytics (privacy-focused). No cookies, no tracking, no personal data. 
              Aggregated statistics only.
            </p>
          </div>
        </div>
      </section>

      {/* Data Security */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">DATA SECURITY</h2>
        <ul className="font-mono text-sm text-nr1-muted leading-relaxed space-y-2 list-disc list-inside ml-4">
          <li>We do not store user data, so there is no data to secure</li>
          <li>Our website uses HTTPS encryption</li>
          <li>Our stream uses secure connections</li>
        </ul>
      </section>

      {/* Your Rights */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">YOUR RIGHTS</h2>
        <p className="font-mono text-sm text-nr1-muted leading-relaxed">
          Since we don&apos;t collect personal information, there is no data to:
        </p>
        <ul className="font-mono text-sm text-nr1-muted leading-relaxed space-y-2 list-disc list-inside ml-4">
          <li>Request access to</li>
          <li>Request deletion of</li>
          <li>Request correction of</li>
        </ul>
      </section>

      {/* Children's Privacy */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">CHILDREN&apos;S PRIVACY</h2>
        <p className="font-mono text-sm text-nr1-muted leading-relaxed">
          Our service is not directed to children under 13. We do not knowingly collect 
          information from children.
        </p>
      </section>

      {/* Changes to Policy */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">CHANGES TO THIS POLICY</h2>
        <p className="font-mono text-sm text-nr1-muted leading-relaxed">
          We may update this privacy policy occasionally. Changes will be posted on this page 
          with an updated "Last Updated" date.
        </p>
      </section>

      {/* Contact */}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl text-white tracking-widest">CONTACT US</h2>
        <p className="font-mono text-sm text-nr1-muted leading-relaxed">
          If you have questions about this privacy policy:
        </p>
        <div className="border border-nr1-cyan/20 rounded-lg bg-nr1-grey/40 p-5 space-y-2">
          <p className="font-mono text-sm text-white">
            <span className="text-nr1-muted">Email:</span>{" "}
            <a href="mailto:Nr1family420@gmail.com" className="text-nr1-cyan hover:underline">
              Nr1family420@gmail.com
            </a>
          </p>
          <p className="font-mono text-sm text-white">
            <span className="text-nr1-muted">Website:</span>{" "}
            <a href="https://listen-nr1dnb.com" className="text-nr1-cyan hover:underline">
              listen-nr1dnb.com
            </a>
          </p>
        </div>
      </section>

      {/* Compliance */}
      <section className="border border-nr1-cyan/20 rounded-lg bg-nr1-cyan/5 p-6 space-y-3">
        <h3 className="font-heading text-lg text-nr1-cyan tracking-widest">COMPLIANCE</h3>
        <p className="font-mono text-xs text-nr1-muted leading-relaxed">
          This privacy policy is compliant with:
        </p>
        <ul className="font-mono text-xs text-nr1-muted leading-relaxed space-y-1 list-disc list-inside ml-4">
          <li>GDPR (EU General Data Protection Regulation)</li>
          <li>UK GDPR</li>
          <li>Amazon Alexa Skills Requirements</li>
          <li>General privacy best practices</li>
        </ul>
      </section>

      {/* Back to home */}
      <div className="pt-8 text-center">
        <a 
          href="/"
          className="inline-block font-mono text-sm text-nr1-cyan hover:text-white transition-colors"
        >
          ← Back to Home
        </a>
      </div>

    </div>
  );
}
