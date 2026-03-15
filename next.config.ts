import type { NextConfig } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_AZURACAST_BASE_URL ?? "https://radio.listen-nr1dnb.com";
const SHORTCODE = process.env.NEXT_PUBLIC_STATION_SHORTCODE ?? "nr1_dnb_radio";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [
      {
        source: "/stream",
        destination: `${BASE_URL}/listen/${SHORTCODE}/radio.mp3`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "radio.listen-nr1dnb.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "radio.listen-nr1dnb.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
