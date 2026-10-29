import { settings } from '../config.js';
import { activeDaysBetween } from '../calendar.js';
import { round } from './cycle-time.js';
import type { LeadTimeResult, StoryTrace } from '../types.js';

/**
 * Lead Time starts when the story moves to "Ready to do" and ends when it is
 * deployed to the test environment. Until the deployment workflow stamps that
 * event, completion (`date_closed`) is used as the deployment proxy.
 */
export function leadTime(traces: StoryTrace[]): LeadTimeResult {
  const items = traces
    .filter((trace) => trace.readyAt !== null)
    .map((trace) => {
      const deployedAt = trace.doneAt;
      const activeDays =
        trace.readyAt !== null && deployedAt !== null ? activeDaysBetween(trace.readyAt, deployedAt) : null;
      return { id: trace.id, name: trace.name, readyAt: trace.readyAt, deployedAt, activeDays };
    });

  const measurable = items.filter(
    (item): item is typeof item & { activeDays: number } => item.activeDays !== null,
  );
  const total = measurable.reduce((sum, item) => sum + item.activeDays, 0);

  return {
    averageActiveDays: measurable.length > 0 ? round(total / measurable.length) : null,
    sample: measurable.length,
    items,
    exceeded: measurable
      .filter((item) => item.activeDays > settings.thresholds.leadTime)
      .map((item) => ({ id: item.id, name: item.name, activeDays: item.activeDays })),
  };
}
