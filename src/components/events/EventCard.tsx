import Image from "next/image";
import type { EventRow } from "@/lib/supabase";

interface EventCardProps {
  event: EventRow;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function EventCard({ event }: EventCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-nr1-grey overflow-hidden flex flex-col group hover:border-nr1-cyan/30 transition-colors">
      <div className="relative aspect-square bg-nr1-black">
        {event.flyer_url ? (
          <Image
            src={event.flyer_url}
            alt={event.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-nr1-cyan font-heading text-4xl opacity-30">NR1</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <p className="text-xs font-mono text-nr1-cyan">{formatDate(event.date)}</p>
        <h3 className="text-base font-body font-semibold text-white">{event.name}</h3>
        {event.venue && (
          <p className="text-sm font-mono text-nr1-muted">{event.venue}</p>
        )}
        {event.description && (
          <p className="text-sm text-white/60 line-clamp-2 flex-1">{event.description}</p>
        )}
        {event.ticket_url && (
          <a
            href={event.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-nr1-cyan text-nr1-black text-sm font-mono font-bold hover:bg-nr1-cyan/90 transition-colors"
          >
            Get Tickets
          </a>
        )}
      </div>
    </div>
  );
}
