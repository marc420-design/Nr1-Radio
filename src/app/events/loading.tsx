import { SkeletonEventCard } from "@/components/ui/SkeletonLoader";

export default function EventsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="font-heading text-5xl sm:text-6xl text-nr1-cyan tracking-widest">
          EVENTS
        </h1>
        <p className="font-mono text-sm text-nr1-muted tracking-widest uppercase">
          Upcoming NR1 Events & Appearances
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonEventCard key={i} />
        ))}
      </div>
    </div>
  );
}
