import { SkeletonDJCard } from "@/components/ui/SkeletonLoader";

export default function DJsLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="font-heading text-5xl sm:text-6xl text-nr1-cyan tracking-widest">
          THE CREW
        </h1>
        <p className="font-mono text-sm text-nr1-muted tracking-widest uppercase">
          Meet the DJs & MCs
        </p>
      </div>

      <section className="space-y-6">
        <h2 className="font-heading text-2xl text-white tracking-widest">RESIDENTS</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonDJCard key={i} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-heading text-2xl text-white tracking-widest">GUESTS</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonDJCard key={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
