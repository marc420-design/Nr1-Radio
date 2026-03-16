import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Space_Mono, DM_Sans } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
import { NavLinks } from "@/components/ui/NavLinks";
import { SOCIAL_LINKS } from "@/lib/constants";
import { STATION_META } from "@/lib/station";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { StickyPlayer } from "@/components/player/StickyPlayer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${STATION_META.name} — Live Drum & Bass`,
  description: STATION_META.description,
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: STATION_META.name,
    description: STATION_META.description,
    type: "website",
    url: STATION_META.siteUrl,
    images: [
      {
        url: STATION_META.logoUrl,
        width: 512,
        height: 512,
        alt: STATION_META.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: STATION_META.name,
    description: STATION_META.description,
    images: [STATION_META.logoUrl],
  },
};

export const viewport: Viewport = {
  themeColor: "#00E5FF",
};

const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${spaceMono.variable} ${dmSans.variable}`}>
      <body className="bg-nr1-black text-white font-body antialiased min-h-screen">
        <PlayerProvider>
        {/* Navigation */}
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

        {/* Page content — bottom padding clears the sticky player bar */}
        <main className="pb-20">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        {/* Persistent player — always visible across all pages */}
        <StickyPlayer />

        {/* Footer */}
        <footer className="footer-top-shadow border-t border-nr1-cyan/20 pt-8 pb-24 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Service Worker registration */}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />

        {/* Umami Analytics */}
        {umamiId && (
          <Script
            src="https://analytics.umami.is/script.js"
            data-website-id={umamiId}
            strategy="afterInteractive"
          />
        )}

        </PlayerProvider>

        {/* JSON-LD structured data — RadioBroadcastService */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RadioBroadcastService",
              name: STATION_META.name,
              alternateName: STATION_META.shortName,
              description: STATION_META.description,
              url: STATION_META.siteUrl,
              broadcastDisplayName: STATION_META.name,
              logo: {
                "@type": "ImageObject",
                url: STATION_META.logoUrl,
                width: 512,
                height: 512,
              },
              broadcastAffiliateOf: {
                "@type": "Organization",
                name: STATION_META.name,
                foundingDate: STATION_META.founded,
                location: {
                  "@type": "Place",
                  name: `${STATION_META.city}, ${STATION_META.region}, ${STATION_META.country}`,
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: STATION_META.city,
                    addressRegion: STATION_META.region,
                    addressCountry: STATION_META.countryCode,
                  },
                },
              },
              potentialAction: {
                "@type": "ListenAction",
                target: [
                  {
                    "@type": "EntryPoint",
                    urlTemplate: STATION_META.siteUrl,
                    actionPlatform: [
                      "http://schema.org/DesktopWebPlatform",
                      "http://schema.org/MobileWebPlatform",
                    ],
                  },
                ],
              },
              sameAs: [
                STATION_META.social.facebook,
                STATION_META.social.youtube,
                STATION_META.social.mixcloud,
                STATION_META.social.soundcloud,
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
