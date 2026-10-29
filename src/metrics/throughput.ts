import { settings } from '../config.js';
import type { StoryTrace, ThroughputResult } from '../types.js';

/**
 * The indicator only applies to active development weeks. Planning, validation
 * and pause weeks have no expected delivery, so they report without alerting.
 */
export function throughput(traces: StoryTrace[], start: string, end: string, evaluated = true): ThroughputResult {
  const stories = traces
    .filter((trace): trace is StoryTrace & { doneAt: string } => trace.doneAt !== null)
    .filter((trace) => trace.doneAt >= start && trace.doneAt < end)
    .map((trace) => ({ id: trace.id, name: trace.name, doneAt: trace.doneAt }));

  return {
    weekStart: start,
    weekEnd: end,
    stories,
    total: stories.length,
    meetsTarget: !evaluated || stories.length >= settings.thresholds.throughput.min,
    evaluated,
  };
}
