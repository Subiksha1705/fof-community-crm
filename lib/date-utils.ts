// Authoritative Date & Time Handling as per PRD Section 4

export const SEED_REFERENCE_DATE = "2024-08-19";

/**
 * Normalizes any date input to a plain local calendar date (midnight), ignoring time of day.
 */
export function toCalendarDate(date: string | Date): Date {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Counts difference in normalized calendar days between two dates.
 * d2 - d1: if d2 > d1, result is positive.
 */
export function daysBetweenCalendarDates(date1: string | Date, date2: string | Date): number {
  const d1 = toCalendarDate(date1);
  const d2 = toCalendarDate(date2);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Formats a calendar date string (YYYY-MM-DD or ISO) into a human readable form like "Aug 18, 2024".
 */
export function formatCalendarDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats relative day difference into friendly UI text.
 */
export function formatRelativeDays(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 0) return `In ${Math.abs(days)} days`;
  return `${days} days ago`;
}
