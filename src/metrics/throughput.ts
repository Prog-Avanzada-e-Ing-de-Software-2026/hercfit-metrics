import { settings } from '../config.js';
import type { WeekWindow } from '../config.js';
import { weekOf } from '../calendar.js';
import { round } from './cycle-time.js';
import type { StoryTrace, ThroughputResult, ThroughputWeek } from '../types.js';

/**
 * The indicator is an average, not a weekly quota: "el promedio de HUs
 * completadas por semana debe ser mayor a 4". The sample is every completed
 * development week, so planning and pause weeks never drag the average down
 * and a week still in progress is not counted as a zero.
 */
export function throughput(traces: StoryTrace[], weeks: WeekWindow[], today: string): ThroughputResult {
  const done = traces.filter((trace): trace is StoryTrace & { doneAt: string } => trace.doneAt !== null);

  const countBetween = (start: string, end: string): number =>
    done.filter((trace) => trace.doneAt >= start && trace.doneAt < end).length;

  const completed = weeks
    .filter((week) => week.desarrollo && week.hasta <= today)
    .map((week): ThroughputWeek => ({
      n: week.n,
      start: week.desde,
      end: week.hasta,
      count: countBetween(week.desde, week.hasta),
    }));

  const currentWeek = weekOf(today);
  const current = currentWeek
    ? {
        start: currentWeek.desde,
        end: currentWeek.hasta,
        count: countBetween(currentWeek.desde, currentWeek.hasta),
        development: currentWeek.desarrollo,
      }
    : null;

  const evaluated = completed.length > 0;
  const total = completed.reduce((sum, week) => sum + week.count, 0);
  const average = evaluated ? round(total / completed.length) : null;

  return {
    current,
    weeks: completed,
    average,
    meetsTarget: average === null ? true : average > settings.thresholds.throughput.min,
    evaluated,
  };
}
