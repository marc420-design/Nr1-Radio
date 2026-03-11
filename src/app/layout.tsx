import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Space_Mono, DM_Sans } from "next/font/google";
import Script from "next/script";
import Link from "next/link";
import Image from "next/image";
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
  title: "NR1 DNB Radio — Live Drum & Bass",
  description: "Norwich's finest drum & bass radio station. Listen live 24/7.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    title: "NR1 DNB Radio",
    description: "Norwich's finest drum & bass radio station. Listen live 24/7.",
    type: "website",
    url: "https://listen-nr1dnb.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "NR1 DNB Radio",
    description: "Norwich's finest drum & bass radio station. Listen live 24/7.",
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
        {/* Navigation */}
        <nav className="sticky top-0 z-40 bg-nr1-black/80 backdrop-blur-md border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image src="/icons/icon-192.png" alt="NR1 DNB" width={32} height={32} className="rounded-sm" />
                <span className="font-heading text-2xl text-nr1-cyan tracking-widest">NR1 DNB</span>
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/schedule" className="text-sm font-mono text-nr1-muted hover:text-nr1-cyan transition-colors">
                  Schedule
                </Link>
                <Link href="/events" className="text-sm font-mono text-nr1-muted hover:text-nr1-cyan transition-colors">
                  Events
                </Link>
                <Link href="/about" className="text-sm font-mono text-nr1-muted hover:text-nr1-cyan transition-colors">
                  About
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="pb-24 lg:pb-0">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs font-mono text-nr1-muted">
                © {new Date().getFullYear()} NR1 DNB Radio · Norwich, UK
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-nr1-muted">
                <a href="mailto:demos@nr1dnb.com" className="hover:text-nr1-cyan transition-colors">
                  Submit Demo
                </a>
                <span>·</span>
                <a href="mailto:bookings@nr1dnb.com" className="hover:text-nr1-cyan transition-colors">
                  Bookings
                </a>
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
      </body>
    </html>
  );
}
