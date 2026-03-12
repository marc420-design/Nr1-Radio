/**
 * Skeleton loader components for displaying loading states.
 * Provides visual feedback while data is being fetched.
 */

export function SkeletonCard() {
  return (
    <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-3 animate-pulse">
      <div className="h-6 bg-white/10 rounded w-3/4"></div>
      <div className="h-4 bg-white/5 rounded w-full"></div>
      <div className="h-4 bg-white/5 rounded w-5/6"></div>
    </div>
  );
}

export function SkeletonScheduleGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-8 bg-nr1-cyan/20 rounded animate-pulse"></div>
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-20 bg-white/5 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonEventCard() {
  return (
    <div className="border border-white/10 rounded-lg bg-nr1-grey/40 overflow-hidden animate-pulse">
      <div className="aspect-square bg-white/10"></div>
      <div className="p-5 space-y-3">
        <div className="h-6 bg-white/10 rounded w-3/4"></div>
        <div className="h-4 bg-white/5 rounded w-1/2"></div>
        <div className="h-4 bg-white/5 rounded w-full"></div>
        <div className="h-4 bg-white/5 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function SkeletonDJCard() {
  return (
    <div className="border border-white/10 rounded-lg bg-nr1-grey/40 p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-white/10"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-white/10 rounded w-3/4"></div>
          <div className="h-4 bg-white/5 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-white/5 rounded w-full"></div>
        <div className="h-4 bg-white/5 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-white/5 rounded"
          style={{ width: i === lines - 1 ? "75%" : "100%" }}
        ></div>
      ))}
    </div>
  );
}
