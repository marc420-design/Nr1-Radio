"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/schedule", label: "Schedule" },
  { href: "/events",   label: "Events" },
  { href: "/shows",    label: "Shows" },
  { href: "/djs",      label: "DJs & MCs" },
  { href: "/about",    label: "About" },
] as const;

export function NavLinks() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClass = (href: string) =>
    pathname === href
      ? "px-3 py-1.5 text-xs font-mono text-nr1-cyan bg-nr1-cyan/10 hover:bg-nr1-cyan/20 rounded transition-colors"
      : "px-3 py-1.5 text-xs font-mono text-nr1-muted hover:text-nr1-cyan hover:bg-nr1-cyan/5 rounded transition-colors";

  return (
    <>
      {/* Desktop nav */}
      <div className="hidden sm:flex items-center gap-1 pl-4 border-l border-white/10">
        {NAV_ITEMS.map(({ href, label }) => (
          <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={linkClass(href)}>
            {label}
          </Link>
        ))}
      </div>

      {/* Mobile hamburger */}
      <button
        className="sm:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <span className={`block w-5 h-0.5 bg-nr1-cyan transition-all ${open ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`block w-5 h-0.5 bg-nr1-cyan transition-all ${open ? "opacity-0" : ""}`} />
        <span className={`block w-5 h-0.5 bg-nr1-cyan transition-all ${open ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="sm:hidden fixed top-16 left-0 right-0 z-50 bg-nr1-black/98 border-b border-nr1-cyan/20 backdrop-blur-md">
          <nav className="flex flex-col px-4 py-3">
            {NAV_ITEMS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={`py-3 text-sm font-mono border-b border-white/5 last:border-0 ${
                  pathname === href ? "text-nr1-cyan" : "text-nr1-muted"
                }`}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
