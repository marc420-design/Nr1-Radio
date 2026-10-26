"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { NavLinks } from "@/components/ui/NavLinks";
import { StickyPlayer } from "@/components/player/StickyPlayer";
import { PwaInstallBanner } from "@/components/ui/PwaInstallBanner";
import { SOCIAL_LINKS } from "@/lib/constants";

// Only directories where the station is actually listed, linked to its own page
// rather than a search. Verified 2026-10-26; re-check if a listing is removed.
//
// Deliberately absent:
//   TuneIn         - not listed. The Broadcaster Portal submission never resulted
//                    in an entry (a search of their API returns no matches), so a
//                    link would land on an empty result page. Add back once live.
//   internet-radio - no station entry there either; the old link went to their
//                    homepage, implying a listing that does not exist.
//   Radio Browser  - an aggregator database rather than a place to listen, and it
//                    currently holds a duplicate entry whose homepage and favicon
//                    point at the dead listen.nr1dnb.com host.
//
// myTuner and OnlineRadioBox both ask for a reciprocal link in their approval
// emails, which this row provides.
const DIRECTORY_LINKS = [
  { label: "radio.net",       href: "https://www.radio.net/s/nr1dnbradio" },
  { label: "OnlineRadioBox",  href: "https://onlineradiobox.com/uk/nr1dnb/" },
  { label: "myTuner",         href: "https://mytuner-radio.com/radio/nr1-dnb-radio-518564/" },
  { label: "Streema",         href: "https://streema.com/radios/NR1_DNB_Radio" },
] as const;

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEmbed = pathname === "/embed";

  if (isEmbed) {
    return <main>{children}</main>;
  }

  return (
    <>
      <nav className="sticky top-0 z-40 bg-nr1-black/85 backdrop-blur-md border-b border-nr1-cyan/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Image src="/icons/icon-192.png" alt="NR1 DNB" width={28} height={28} className="rounded-sm" />
              <span className="font-heading text-2xl text-nr1-cyan tracking-widest">NR1 DNB</span>
            </Link>
            <NavLinks />
          </div>
        </div>
      </nav>

      <main className="pb-20">
        {children}
      </main>

      <PwaInstallBanner />
      <StickyPlayer />

      <footer className="footer-top-shadow border-t border-nr1-cyan/20 pt-8 pb-24 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Directory links */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
            <span className="text-xs font-mono text-nr1-muted shrink-0">Listen on:</span>
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
              {DIRECTORY_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-full border border-white/10 text-xs font-mono text-nr1-muted hover:text-nr1-cyan hover:border-nr1-cyan/30 transition-colors"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5" />

          {/* Social + legal */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs font-mono text-nr1-muted">
              © {new Date().getFullYear()} NR1 DNB Radio · Norwich, UK
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-nr1-muted">
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-nr1-cyan transition-colors">Facebook</a>
              <span>·</span>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-nr1-cyan transition-colors">YouTube</a>
              <span>·</span>
              <a href={SOCIAL_LINKS.mixcloud} target="_blank" rel="noopener noreferrer" className="hover:text-nr1-cyan transition-colors">Mixcloud</a>
              <span>·</span>
              <a href={SOCIAL_LINKS.soundcloud} target="_blank" rel="noopener noreferrer" className="hover:text-nr1-cyan transition-colors">SoundCloud</a>
              <span>·</span>
              <a href={`mailto:${SOCIAL_LINKS.email}`} className="hover:text-nr1-cyan transition-colors">Contact</a>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-nr1-muted">
              <Link href="/privacy" className="hover:text-nr1-cyan transition-colors">Privacy</Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-nr1-cyan transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
