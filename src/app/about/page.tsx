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
            NR1 Drum & Bass — est. 2018. Norwich&apos;s home of underground DNB, broadcasting 24/7 with
            30+ DJs and MCs representing the scene.
          </p>
          <p>
            DJing and MCing has changed over the years. Now it&apos;s more about being the soul of the party.
            We here at NR1 believe that being a DJ/MC is about making people happy with good positive vibes —
            playing and mixing music is our way of interacting with people.
          </p>
          <p className="font-mono text-nr1-cyan text-sm tracking-wide">
            &ldquo;Music is life, that&apos;s why our hearts have beats.&rdquo;
          </p>
          <p className="text-white/40 text-sm font-mono">
            R.I.P Jonny Fidd aka Jonny 2 Bad | J2B — forever in our hearts brother.
          </p>
        </div>

        {/* Socials */}
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { label: "Facebook", href: "https://www.facebook.com/nr1dnb" },
            { label: "YouTube", href: "https://youtube.com/@nr1family420" },
            { label: "Mixcloud", href: "https://www.mixcloud.com/Nr1family/" },
            { label: "SoundCloud", href: "https://soundcloud.com/nr1-family" },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-white/10 bg-nr1-grey font-mono text-sm text-nr1-cyan hover:border-nr1-cyan/40 transition-colors"
            >
              {s.label}
            </a>
          ))}
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-nr1-grey p-5">
            <h3 className="font-heading text-xl text-nr1-cyan mb-2">Submit a Demo</h3>
            <p className="text-sm text-white/60 mb-3">Got a mix or original track? We want to hear it.</p>
            <a
              href="mailto:Nr1family420@gmail.com"
              className="text-sm font-mono text-nr1-cyan hover:underline"
            >
              Nr1family420@gmail.com →
            </a>
          </div>
          <div className="rounded-xl border border-white/10 bg-nr1-grey p-5">
            <h3 className="font-heading text-xl text-nr1-cyan mb-2">Bookings & Press</h3>
            <p className="text-sm text-white/60 mb-3">For show bookings, sponsorship, or press enquiries.</p>
            <a
              href="mailto:Nr1family420@gmail.com"
              className="text-sm font-mono text-nr1-cyan hover:underline"
            >
              Nr1family420@gmail.com →
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
