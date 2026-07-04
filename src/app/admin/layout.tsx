import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "NR1 Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-nr1-black text-white">
      <header className="border-b border-nr1-cyan/20 bg-nr1-grey/50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6">
          <Link href="/admin" className="font-heading text-nr1-cyan tracking-widest text-sm">
            NR1 ADMIN
          </Link>
          <nav className="flex gap-4 text-xs font-mono text-nr1-muted">
            <Link href="/admin/tracklists" className="hover:text-nr1-cyan">TRACKLISTS</Link>
          </nav>
          <div className="ml-auto text-xs font-mono text-nr1-muted">
            <Link href="/" className="hover:text-nr1-cyan">← back to site</Link>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
