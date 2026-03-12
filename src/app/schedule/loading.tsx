import { SkeletonScheduleGrid } from "@/components/ui/SkeletonLoader";

export default function ScheduleLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="font-heading text-5xl sm:text-6xl text-nr1-cyan tracking-widest">
          SCHEDULE
        </h1>
        <p className="font-mono text-sm text-nr1-muted tracking-widest uppercase">
          Weekly Show Schedule
        </p>
      </div>

      <SkeletonScheduleGrid />
    </div>
  );
}
