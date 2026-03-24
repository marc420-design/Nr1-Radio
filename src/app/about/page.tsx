import type { Metadata } from "next";
import { SOCIAL_LINKS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About — NR1 DNB Radio",
  description: "Norwich's underground drum & bass radio station. Est. 2018. 20+ DJs & MCs broadcasting 24/7.",
};

export const revalidate = 3600;

export default async function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* About NR1 */}
      <section className="max-w-3xl">
        <div className="section-heading-rule mb-6">
          <h1 className="font-heading text-5xl sm:text-6xl text-white tracking-wide">About NR1</h1>
        </div>
        <div className="space-y-4 font-body text-white/70 leading-relaxed">
          <p>
            NR1 Drum & Bass — est. 2018. Norwich&apos;s home of underground DNB, broadcasting 24/7 with
            20+ DJs and MCs representing the scene.
          </p>
          <p>
            DJing and MCing has changed over the years. Now it&apos;s more about being the soul of the party.
            We here at NR1 believe that being a DJ/MC is about making people happy with good positive vibes —
            playing and mixing music is our way of interacting with people.
          </p>
          <p className="font-mono text-nr1-cyan text-sm tracking-wide">
            &ldquo;Music is life, that&apos;s why our hearts have beats.&rdquo;
          </p>
          <p className="text-white/40 text-sm font-mono">
            R.I.P Jonny Fidd aka Jonny 2 Bad | J2B — forever in our hearts brother.
          </p>
        </div>

        {/* Socials */}
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { label: "Facebook",   href: SOCIAL_LINKS.facebook },
            { label: "YouTube",    href: SOCIAL_LINKS.youtube },
            { label: "Mixcloud",   href: SOCIAL_LINKS.mixcloud },
            { label: "SoundCloud", href: SOCIAL_LINKS.soundcloud },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-white/10 bg-nr1-grey font-mono text-sm text-nr1-cyan hover:border-nr1-cyan/40 transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-nr1-grey p-5">
            <h3 className="font-heading text-xl text-nr1-cyan mb-2">Submit a Demo</h3>
            <p className="text-sm text-white/60 mb-3">Got a mix or original track? We want to hear it.</p>
            <a
              href={`mailto:${SOCIAL_LINKS.email}`}
              className="text-sm font-mono text-nr1-cyan hover:underline"
            >
              {SOCIAL_LINKS.email} →
            </a>
          </div>
          <div className="rounded-xl border border-white/10 bg-nr1-grey p-5">
            <h3 className="font-heading text-xl text-nr1-cyan mb-2">Bookings & Press</h3>
            <p className="text-sm text-white/60 mb-3">For show bookings, sponsorship, or press enquiries.</p>
            <a
              href={`mailto:${SOCIAL_LINKS.email}`}
              className="text-sm font-mono text-nr1-cyan hover:underline"
            >
              {SOCIAL_LINKS.email} →
            </a>
          </div>
        </div>

        {/* Meet the team */}
        <div className="mt-8 rounded-xl border border-white/10 bg-nr1-grey p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-heading text-xl text-white mb-1">Meet the Team</h3>
            <p className="text-sm text-white/60">20+ DJs and MCs — see the full crew.</p>
          </div>
          <a
            href="/djs"
            className="shrink-0 px-4 py-2 rounded-lg border border-nr1-cyan/30 bg-nr1-cyan/5 font-mono text-sm text-nr1-cyan hover:border-nr1-cyan/60 transition-colors"
          >
            View the crew →
          </a>
        </div>
      </section>
    </div>
  );
}
