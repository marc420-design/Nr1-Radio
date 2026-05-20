import type { Metadata } from "next";
import { ShowCard } from "@/components/shows/ShowCard";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { ShowRow } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Shows — NR1 DNB Radio",
  description: "Archive of NR1 DNB Radio shows and DJ sets. Drum & bass mixes from Norwich's finest crew.",
  alternates: {
    canonical: "https://listen-nr1dnb.com/shows",
  },
};

export const revalidate = 3600;

export default async function ShowsPage() {
  let shows: ShowRow[] = [];

  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("shows")
      .select("*")
      .order("uploaded_at", { ascending: false });
    shows = (data as ShowRow[]) ?? [];
  } catch {
    // Supabase not configured yet — show empty state
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <div className="section-heading-rule">
          <h1 className="font-heading text-5xl sm:text-6xl text-white tracking-wide">Shows</h1>
        </div>
        <p className="font-mono text-sm text-nr1-muted mt-2">
          Archive of sets & sessions · updated regularly
        </p>
      </div>

      {shows.length === 0 ? (
        <div className="space-y-10">

          {/* Mixcloud embed */}
          <div className="space-y-4">
            <h2 className="font-heading text-2xl text-white tracking-widest">LATEST MIXES ON MIXCLOUD</h2>
            <div className="rounded-xl overflow-hidden border border-white/10">
              <iframe
                width="100%"
                height="400"
                src="https://www.mixcloud.com/widget/iframe/?hide_cover=1&feed=%2FNr1family%2F"
                frameBorder="0"
                allow="autoplay"
                title="NR1 DNB Radio on Mixcloud"
              />
            </div>
          </div>

          {/* YouTube link */}
          <div className="border border-white/10 rounded-xl p-6 space-y-3">
            <h2 className="font-heading text-xl text-white tracking-widest">FULL ARCHIVE ON YOUTUBE</h2>
            <p className="font-mono text-sm text-nr1-muted">
              Live sessions recorded every Friday — full sets available on the channel.
            </p>
            <a
              href="https://www.youtube.com/@nr1family420"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 px-4 py-2 bg-nr1-cyan/10 border border-nr1-cyan/30 text-nr1-cyan font-mono text-sm rounded-lg hover:bg-nr1-cyan/20 transition-colors"
            >
              Visit YouTube Channel →
            </a>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      )}
    </div>
  );
}
