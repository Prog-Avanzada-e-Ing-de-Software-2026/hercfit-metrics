import { calendar } from './config.js';
import type { WeekWindow } from './config.js';

const DAY_MS = 86_400_000;

function atUtc(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Week whose [desde, hasta) range contains the given date. */
export function weekOf(date: string): WeekWindow | null {
  const target = atUtc(date);
  return (
    calendar.semanas.find((week) => target >= atUtc(week.desde) && target < atUtc(week.hasta)) ?? null
  );
}

export function currentWeek(today = isoDate(new Date())): WeekWindow | null {
  return weekOf(today);
}

export function isActiveDay(date: string): boolean {
  const target = atUtc(date);
  if (target < atUtc(calendar.inicio) || target >= atUtc(calendar.fin)) return false;
  const week = weekOf(date);
  return week === null ? true : week.activa;
}

/**
 * Lead Time excludes programmed pauses: the project calendar marks week 5 as
 * inactive, so those days never count as active development days.
 */
export function activeDaysBetween(start: string, end: string): number {
  if (end <= start) return 0;
  let count = 0;
  for (let cursor = atUtc(start); cursor < atUtc(end); cursor += DAY_MS) {
    if (isActiveDay(isoDate(new Date(cursor)))) count += 1;
  }
  return count;
}

export function weekBounds(week: WeekWindow): { start: string; end: string } {
  return { start: week.desde, end: week.hasta };
}
