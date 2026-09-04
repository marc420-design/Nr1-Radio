import type { SetTime } from "@/lib/setTimes";

interface SetTimesTableProps {
  setTimes: SetTime[];
  totalRuntime: string;
}

export function SetTimesTable({ setTimes, totalRuntime }: SetTimesTableProps) {
  return (
    <section className="mt-14 space-y-5">
      <div className="section-heading-rule">
        <h2 className="font-heading text-3xl sm:text-4xl text-white tracking-wide">
          2026 Set Times
        </h2>
      </div>
      <p className="font-mono text-sm text-nr1-muted">
        NR1 New Sets 2026 runs Saturday 01:00 to Sunday 22:47 UK local. Total runtime: {totalRuntime}.
      </p>

      <div className="overflow-x-auto border border-white/10 rounded-lg">
        <table className="min-w-full text-left">
          <thead className="bg-white/5 text-xs font-mono uppercase text-nr1-cyan tracking-widest">
            <tr>
              <th className="px-3 py-3 w-12">#</th>
              <th className="px-3 py-3">Time</th>
              <th className="px-3 py-3">Artist</th>
              <th className="px-3 py-3">Set</th>
              <th className="px-3 py-3 text-right">Length</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {setTimes.map((set) => (
              <tr key={set.slot} className="hover:bg-white/[0.03]">
                <td className="px-3 py-3 font-mono text-xs text-white/50">{set.slot}</td>
                <td className="px-3 py-3 font-mono text-xs text-white whitespace-nowrap">
                  {set.start} - {set.end}
                </td>
                <td className="px-3 py-3 text-sm text-nr1-cyan">{set.artist}</td>
                <td className="px-3 py-3 text-sm text-white">{set.title}</td>
                <td className="px-3 py-3 font-mono text-xs text-nr1-muted text-right whitespace-nowrap">
                  {set.duration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
