import plan from "@/data/year-programming.json";
import { addCalendarDays, londonDate } from "@/lib/schedule";

export function programmeYear(date: string): number | null {
  if (date < plan.startDate) return null;
  const weekday = new Date(date + "T12:00:00Z").getUTCDay();
  if (weekday === 0 || weekday === 6) return plan.weekendYear;
  let weekdays = 0;
  for (let current = plan.weekdayStart; current < date; current = addCalendarDays(current, 1)) {
    const day = new Date(current + "T12:00:00Z").getUTCDay();
    if (day !== 0 && day !== 6) weekdays++;
  }
  return plan.weekdayYears[weekdays % plan.weekdayYears.length];
}
export function todayProgramme(now = new Date()): number | null { return programmeYear(londonDate(now)); }
