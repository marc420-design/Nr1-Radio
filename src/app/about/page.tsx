import { DJCard } from "@/components/about/DJCard";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { DJRow } from "@/lib/supabase";

export const revalidate = 3600;

export default async function AboutPage() {
  let djs: DJRow[] = [];

  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("djs")
      .select("*")
      .order("is_resident", { ascending: false })
      .order("name");
    djs = (data as DJRow[]) ?? [];
  } catch {
    // Supabase not configured yet — show empty state
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* About NR1 */}
      <section className="max-w-3xl">
        <h1 className="font-heading text-5xl sm:text-6xl text-white tracking-wide mb-6">About NR1</h1>
        <div className="space-y-4 font-body text-white/70 leading-relaxed">
          <p>
            NR1 DNB Radio is Norwich's dedicated drum & bass station — broadcasting underground sounds
            24/7 from the heart of East Anglia. We platform local talent alongside international names,
            with a focus on authentic DNB culture.
          </p>
          <p>
            From liquid to neurofunk, jump-up to techstep — we play it all. Tune in live or catch our
            replays to stay connected with the scene.
          </p>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-nr1-grey p-5">
            <h3 className="font-heading text-xl text-nr1-cyan mb-2">Submit a Demo</h3>
            <p className="text-sm text-white/60 mb-3">Got a mix or original track? We want to hear it.</p>
            <a
              href="mailto:demos@nr1dnb.com"
              className="text-sm font-mono text-nr1-cyan hover:underline"
            >
              demos@nr1dnb.com →
            </a>
          </div>
          <div className="rounded-xl border border-white/10 bg-nr1-grey p-5">
            <h3 className="font-heading text-xl text-nr1-cyan mb-2">Bookings & Press</h3>
            <p className="text-sm text-white/60 mb-3">For show bookings, sponsorship, or press enquiries.</p>
            <a
              href="mailto:bookings@nr1dnb.com"
              className="text-sm font-mono text-nr1-cyan hover:underline"
            >
              bookings@nr1dnb.com →
            </a>
          </div>
        </div>
      </section>

      {/* DJs */}
      {djs.length > 0 && (
        <section>
          <h2 className="font-heading text-4xl sm:text-5xl text-white tracking-wide mb-8">
            Our DJs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {djs.map((dj) => (
              <DJCard key={dj.id} dj={dj} />
            ))}
          </div>
        </section>
      )}

      {djs.length === 0 && (
        <section>
          <h2 className="font-heading text-4xl sm:text-5xl text-white tracking-wide mb-4">Our DJs</h2>
          <p className="font-mono text-nr1-muted">DJ profiles coming soon.</p>
        </section>
      )}
    </div>
  );
}
