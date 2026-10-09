"use client";
import { useState } from "react";
import type { ScheduleRow } from "@/lib/supabase";
import { addCalendarDays, formatScheduleTime, isContinuousRotation, WEEKDAYS, weekMonday } from "@/lib/schedule";
import { programmeYear } from "@/lib/programming";
const STYLES: Record<string, string> = { live: "border-nr1-crimson/40 bg-nr1-crimson/10", replay: "border-white/10 bg-white/5", guest: "border-nr1-cyan/30 bg-nr1-cyan/5", special: "border-amber-500/40 bg-amber-500/10" };
function dateLabel(date: string) { return new Date(date + "T12:00:00Z").toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric" }); }
export function ScheduleGrid({ schedule, initialMonday, today }: { schedule: ScheduleRow[]; initialMonday: string; today: string }) {
  const [monday, setMonday] = useState(initialMonday);
  const programmes = schedule.filter(s => !isContinuousRotation(s));
  const buttonClass = "rounded-lg border border-white/20 px-3 py-2 font-mono text-xs text-white hover:border-nr1-cyan";
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-heading text-2xl text-white">{dateLabel(monday)} – {dateLabel(addCalendarDays(monday, 6))}</h2>
      <div className="flex gap-2"><button className={buttonClass} onClick={() => setMonday(addCalendarDays(monday, -7))} aria-label="Previous week">← Previous</button><button className={buttonClass} onClick={() => setMonday(weekMonday())}>This week</button><button className={buttonClass} onClick={() => setMonday(addCalendarDays(monday, 7))} aria-label="Next week">Next →</button></div></div>
    <div className="rounded-xl border border-nr1-cyan/20 bg-nr1-cyan/5 px-4 py-3 font-mono text-sm text-nr1-muted">One archive year each weekday · 2026 sets every Saturday and Sunday · live broadcasts take over automatically.</div>
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-7 gap-4">{WEEKDAYS.map((day, index) => {
      const date = addCalendarDays(monday, index); const dayShows = programmes.filter(s => s.day_of_week === index).sort((a, b) => a.start_time.localeCompare(b.start_time));
      const year = programmeYear(date);
      return <section key={date} className={`rounded-xl border p-3 space-y-3 ${date === today ? "border-nr1-cyan/50 bg-nr1-cyan/5" : "border-white/10"}`}>
        <h3 className="font-mono text-xs text-nr1-cyan uppercase tracking-widest">{day} {date === today && <span className="text-white">· today</span>}<span className="block text-nr1-muted normal-case tracking-normal mt-1">{dateLabel(date)}</span></h3>
        {year && <div className={`rounded-lg border p-3 ${year === 2026 ? STYLES.special : STYLES.replay}`}><p className="font-mono text-xs text-nr1-muted">All day</p><p className="font-heading text-xl text-white mt-2">{year === 2026 ? "2026 Weekend" : `${year} Archive`}</p><p className="font-mono text-xs text-nr1-muted mt-1">{year === 2026 ? "New sets from 2026" : "Sets from this archive year"}</p></div>}
        {dayShows.length ? dayShows.map(show => <div key={show.id} className={`rounded-lg border p-3 ${STYLES[show.show_type] ?? STYLES.replay}`}>
          <p className="font-mono text-xs text-nr1-muted">{formatScheduleTime(show.start_time)} – {formatScheduleTime(show.end_time)}{show.end_time < show.start_time && <span className="block">ends next day</span>}</p>
          <p className="text-sm text-white mt-2">{show.show_name}</p>{show.dj_name && <p className="font-mono text-xs text-nr1-cyan mt-1">{show.dj_name}</p>}
          <p className="font-mono text-[10px] text-nr1-muted uppercase mt-2">{show.show_type}</p>
        </div>) : !year && <p className="font-mono text-xs text-nr1-muted py-3">Archive rotation</p>}
      </section>;
    })}</div>
    <p className="font-mono text-xs text-nr1-muted">Times are UK local (Europe/London). Recording dates are used where verified; other archive years follow original publication dates. Live lineups are announced for each show.</p>
  </div>;
}
