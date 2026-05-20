"use client";

import { useRef, useState, useEffect } from "react";

interface MarqueeTextProps {
  text: string;
  className?: string;
  /** px/s scroll speed — default 40 */
  speed?: number;
  /** ms pause before first scroll starts — default 1500 */
  delay?: number;
}

/**
 * Renders text as a scrolling marquee only when it overflows its container.
 * If the text fits, it renders as plain truncated text with no animation.
 */
export function MarqueeText({ text, className = "", speed = 40, delay = 1500 }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef      = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow]   = useState(false);
  const [duration, setDuration]   = useState("0s");

  useEffect(() => {
    const container = containerRef.current;
    const textEl    = textRef.current;
    if (!container || !textEl) return;

    const check = () => {
      const textWidth = textEl.scrollWidth;
      const boxWidth  = container.clientWidth;
      if (textWidth > boxWidth + 2) {
        // Duration = text width / speed  (we duplicate the text so scroll is seamless)
        setDuration(`${(textWidth / speed).toFixed(2)}s`);
        setOverflow(true);
      } else {
        setOverflow(false);
      }
    };

    check();
    const ro = new ResizeObserver(check);
    ro.observe(container);
    return () => ro.disconnect();
  }, [text, speed]);

  if (!overflow) {
    return (
      <span ref={textRef} className={`truncate block ${className}`}>
        {text}
      </span>
    );
  }

  return (
    <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${className}`}>
      <span
        className="marquee-track inline-block"
        style={{
          animationDuration: duration,
          animationDelay: `${delay}ms`,
        }}
      >
        {/* Duplicate with gap so it loops seamlessly */}
        <span ref={textRef}>{text}</span>
        <span className="inline-block w-16" />
        <span>{text}</span>
        <span className="inline-block w-16" />
      </span>
    </div>
  );
}
