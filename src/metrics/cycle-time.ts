import { settings } from '../config.js';
import { daysBetween } from '../snapshot.js';
import type { CycleTimeResult, StoryTrace } from '../types.js';
import { isoDate } from '../calendar.js';

function thresholdFor(points: number | null): number {
  // The indicator defines 4 days for 1-2 SP stories and 7 days for 5 SP ones.
  // There is no explicit rule for 3-4 SP, so the conservative short threshold applies.
  return points !== null && points >= 5 ? settings.thresholds.cycleTime.large : settings.thresholds.cycleTime.small;
}

export function cycleTime(traces: StoryTrace[], today = isoDate(new Date())): CycleTimeResult {
  const completed = traces.filter(
    (trace): trace is StoryTrace & { inProgressAt: string; doneAt: string } =>
      trace.inProgressAt !== null && trace.doneAt !== null,
  );

  const items = completed.map((trace) => {
    const days = daysBetween(trace.inProgressAt, trace.doneAt);
    const threshold = thresholdFor(trace.points);
    return { id: trace.id, name: trace.name, points: trace.points, days, threshold, exceeded: days > threshold };
  });

  const openOverdue = traces
    .filter(
      (trace): trace is StoryTrace & { inProgressAt: string } =>
        trace.status === 'in progress' && trace.inProgressAt !== null && trace.doneAt === null,
    )
    .map((trace) => {
      const threshold = thresholdFor(trace.points);
      return {
        id: trace.id,
        name: trace.name,
        points: trace.points,
        days: daysBetween(trace.inProgressAt, today),
        threshold,
      };
    })
    .filter((item) => item.days > item.threshold);

  const total = items.reduce((sum, item) => sum + item.days, 0);

  return {
    averageDays: items.length > 0 ? round(total / items.length) : null,
    sample: items.length,
    items,
    openOverdue,
  };
}

export function round(value: number): number {
  return Math.round(value * 10) / 10;
}
