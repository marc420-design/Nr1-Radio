import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Space_Mono, DM_Sans } from "next/font/google";
import Script from "next/script";
import { STATION_META } from "@/lib/station";
import { PlayerProvider } from "@/contexts/PlayerContext";
import { SiteChrome } from "@/components/ui/SiteChrome";
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
  },
  twitter: {
    card: "summary_large_image",
    title: STATION_META.name,
    description: STATION_META.description,
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
        <SiteChrome>
          <ErrorBoundary>{children}</ErrorBoundary>
        </SiteChrome>

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
