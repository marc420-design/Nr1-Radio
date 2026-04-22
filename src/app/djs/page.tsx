import type { Metadata } from "next";
import { DJCard } from "@/components/about/DJCard";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { DJRow } from "@/lib/supabase";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "DJs & MCs — NR1 DNB Radio",
  description: "Meet the 20+ DJs and MCs behind NR1 Drum and Bass Radio. Norwich's underground DNB crew, broadcasting live since 2018.",
  alternates: {
    canonical: "https://listen-nr1dnb.com/djs",
  },
};

export default async function DJsPage() {
  let residents: DJRow[] = [];
  let guests: DJRow[] = [];

  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("djs")
      .select("*")
      .order("name");

    const all = (data as DJRow[]) ?? [];
    residents = all.filter((dj) => dj.is_resident);
    guests    = all.filter((dj) => !dj.is_resident);
  } catch {
    // Supabase not configured — show empty state
  }

  const isEmpty = residents.length === 0 && guests.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

      {/* Header */}
      <div>
        <div className="section-heading-rule mb-2">
          <h1 className="font-heading text-5xl sm:text-6xl text-white tracking-wide">The Crew</h1>
        </div>
        <p className="font-mono text-sm text-nr1-muted mt-3">
          20+ DJs &amp; MCs · Norwich · Est. 2018
        </p>
      </div>

      {isEmpty ? (
        <div className="text-center py-24 space-y-3">
          <p className="font-mono text-nr1-muted">Crew profiles coming soon.</p>
          <p className="text-sm text-nr1-muted/60 font-mono">Follow us on socials to meet the team.</p>
        </div>
      ) : (
        <div className="space-y-16">

          {/* Residents */}
          {residents.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-2xl text-white tracking-widest">RESIDENTS</h2>
                <span className="px-2 py-0.5 rounded-full border border-nr1-crimson/40 bg-nr1-crimson/10 text-nr1-crimson text-xs font-mono">
                  {residents.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {residents.map((dj) => (
                  <DJCard key={dj.id} dj={dj} />
                ))}
              </div>
            </section>
          )}

          {/* Guests */}
          {guests.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-2xl text-white tracking-widest">GUESTS &amp; ASSOCIATES</h2>
                <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-white/40 text-xs font-mono">
                  {guests.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {guests.map((dj) => (
                  <DJCard key={dj.id} dj={dj} />
                ))}
              </div>
            </section>
          )}

        </div>
      )}

    </div>
  );
}
