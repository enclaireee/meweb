import type { Dates, Month } from "@/content/types";

const fmt = new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" });
const fmtMonth = new Intl.DateTimeFormat("en", { month: "short", timeZone: "UTC" });

const toDate = (m: Month) => new Date(`${m}-01T00:00:00Z`);

/** "Jun – Aug 2026", "Feb 2025 – present", "Sep 2026". */
export function formatDates({ start, end }: Dates): string {
  if (end === start) return fmt.format(toDate(start));
  if (end === null) return `${fmt.format(toDate(start))} – present`;
  const s = toDate(start);
  const e = toDate(end);
  if (s.getUTCFullYear() === e.getUTCFullYear()) return `${fmtMonth.format(s)} – ${fmt.format(e)}`;
  return `${fmt.format(s)} – ${fmt.format(e)}`;
}

/** Machine-readable value for <time dateTime>. */
export const isoMonth = (m: Month) => m;
