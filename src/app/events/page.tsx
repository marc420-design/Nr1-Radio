import type { Metadata } from "next";
import { EventCard } from "@/components/events/EventCard";
import { getSupabaseServerClient } from "@/lib/supabase";
import type { EventRow } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Events — NR1 DNB Radio",
  description: "Upcoming NR1 DNB nights and appearances. Live drum & bass events in Norwich and beyond.",
};

export const revalidate = 300;

export default async function EventsPage() {
  let events: EventRow[] = [];

  try {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("events")
      .select("*")
      .contains("tags", ["nr1"])
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date");
    events = (data as EventRow[]) ?? [];
  } catch {
    // Supabase not configured yet — show empty state
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-5xl sm:text-6xl text-white tracking-wide">Events</h1>
        <p className="font-mono text-sm text-nr1-muted mt-2">
          NR1 DNB nights & appearances
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-mono text-nr1-muted">No upcoming events — check back soon.</p>
          <p className="text-sm text-nr1-muted/60 mt-2 font-mono">Follow us on socials for announcements.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
