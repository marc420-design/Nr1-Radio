import type { Metadata } from "next";
import { ShowCard } from "@/components/shows/ShowCard";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { ShowRow } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Shows — NR1 DNB Radio",
  description: "Archive of NR1 DNB Radio shows and DJ sets. Drum & bass mixes from Norwich's finest crew.",
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
        <div className="text-center py-20 space-y-3">
          <p className="font-heading text-2xl text-white/20 tracking-widest">ARCHIVE COMING SOON</p>
          <p className="font-mono text-sm text-nr1-muted">Sets are uploaded regularly — check back soon.</p>
          <p className="font-mono text-xs text-nr1-muted/60">
            In the meantime,{" "}
            <a
              href="https://www.mixcloud.com/Nr1family/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nr1-cyan hover:underline"
            >
              find us on Mixcloud
            </a>{" "}
            and{" "}
            <a
              href="https://www.youtube.com/@nr1family420"
              target="_blank"
              rel="noopener noreferrer"
              className="text-nr1-cyan hover:underline"
            >
              YouTube
            </a>
            .
          </p>
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
