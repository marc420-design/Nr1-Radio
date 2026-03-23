import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NR1 Drum and Bass Radio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#070709",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        {/* Cyan glow blob */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Logo */}
        <img
          src="https://listen-nr1dnb.com/icons/icon-512.png"
          width={200}
          height={200}
          style={{ marginBottom: 24 }}
        />

        {/* Station name */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#00E5FF",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          NR1 DNB RADIO
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#6B7280",
            marginTop: 16,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          Norwich · Drum &amp; Bass · 24/7
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 22,
            color: "#ffffff40",
            marginTop: 12,
            letterSpacing: "0.1em",
          }}
        >
          listen-nr1dnb.com
        </div>
      </div>
    ),
    { ...size }
  );
}
