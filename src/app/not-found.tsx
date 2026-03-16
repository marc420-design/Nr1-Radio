import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 text-center gap-6">
      <p className="font-heading text-8xl text-nr1-cyan tracking-widest">404</p>
      <p className="font-heading text-2xl text-white tracking-widest">PAGE NOT FOUND</p>
      <p className="font-mono text-sm text-nr1-muted max-w-xs">
        That frequency doesn&apos;t exist. Head back to the station.
      </p>
      <Link
        href="/"
        className="font-mono text-xs text-nr1-cyan border border-nr1-cyan/40 rounded px-4 py-2 hover:bg-nr1-cyan/10 transition-colors"
      >
        ← Back to NR1 DNB Radio
      </Link>
    </div>
  );
}
