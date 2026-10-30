import { settings } from '../config.js';
import { activeDaysBetween } from '../calendar.js';
import { storyNumberOf } from '../github/merges.js';
import { round } from './cycle-time.js';
import type { LeadTimeResult, StoryTrace } from '../types.js';

/**
 * Lead Time starts when the story moves to "Ready to do" and ends when it is
 * integrated into `develop`. The integration date comes from the merge of the
 * pull request that declares the story as `HU: <n>`.
 */
export function leadTime(traces: StoryTrace[], merges: Map<number, string>): LeadTimeResult {
  const items = traces
    .filter((trace) => trace.readyAt !== null)
    .map((trace) => {
      const storyNumber = storyNumberOf(trace.name);
      const integratedAt = storyNumber === null ? null : (merges.get(storyNumber) ?? null);
      const activeDays =
        trace.readyAt !== null && integratedAt !== null ? activeDaysBetween(trace.readyAt, integratedAt) : null;
      return { id: trace.id, name: trace.name, storyNumber, readyAt: trace.readyAt, integratedAt, activeDays };
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
