import Link from "next/link";

export default function ShowNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="font-heading text-4xl text-white tracking-wide">Show not found</h1>
      <p className="font-mono text-sm text-nr1-muted mt-3">
        This set may have been removed or the link is wrong.
      </p>
      <Link
        href="/shows"
        className="inline-block mt-6 px-4 py-2 bg-nr1-cyan/10 border border-nr1-cyan/30 text-nr1-cyan font-mono text-sm rounded-lg hover:bg-nr1-cyan/20"
      >
        ← Browse all shows
      </Link>
    </div>
  );
}
