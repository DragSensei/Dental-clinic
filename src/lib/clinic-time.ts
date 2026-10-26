export const CLINIC_TIME_ZONE = "Africa/Cairo";

/**
 * Converts clinic-local "YYYY-MM-DD" + "HH:MM" to a UTC epoch ms, DST-safe.
 */
export function clinicInstant(date: string, time: string): number {
  const [yearStr, monthStr, dayStr] = date.split("-");
  const [hourStr, minuteStr] = time.split(":");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(new Date(utcGuess));
  const p: Record<string, string> = {};
  for (const part of parts) {
    p[part.type] = part.value;
  }

  const cairoYear = parseInt(p.year, 10);
  const cairoMonth = parseInt(p.month, 10);
  const cairoDay = parseInt(p.day, 10);
  const cairoHour = parseInt(p.hour, 10);
  const cairoMinute = parseInt(p.minute, 10);

  const asLocal = Date.UTC(cairoYear, cairoMonth - 1, cairoDay, cairoHour, cairoMinute);
  const offset = asLocal - utcGuess;

  return utcGuess - offset;
}

export function hoursUntil(date: string, time: string, now = Date.now()): number {
  return (clinicInstant(date, time) - now) / 3_600_000;
}

export const CANCEL_WINDOW_HOURS = 24;
