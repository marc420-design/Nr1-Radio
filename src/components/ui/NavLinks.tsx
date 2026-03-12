"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/schedule", label: "Schedule" },
  { href: "/events",   label: "Events" },
  { href: "/djs",      label: "DJs" },
  { href: "/about",    label: "About" },
  { href: "/listen",   label: "Listen" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 pl-4 border-l border-white/10">
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "px-3 py-1.5 text-xs font-mono text-nr1-cyan bg-nr1-cyan/10 hover:bg-nr1-cyan/20 rounded transition-colors"
                : "px-3 py-1.5 text-xs font-mono text-nr1-muted hover:text-nr1-cyan hover:bg-nr1-cyan/5 rounded transition-colors"
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
