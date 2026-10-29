import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { settings } from './config.js';
import type { ClickUpTask, Snapshot, SnapshotTask, StoryTrace } from './types.js';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function snapshotPath(date: string): string {
  return join(settings.paths.snapshots, `${date}.json`);
}

export function writeSnapshot(tasks: ClickUpTask[], date = today()): Snapshot {
  mkdirSync(settings.paths.snapshots, { recursive: true });
  const snapshot: Snapshot = {
    date,
    takenAt: new Date().toISOString(),
    tasks: Object.fromEntries(
      tasks.map((task) => [
        task.id,
        {
          id: task.id,
          name: task.name,
          status: task.status,
          points: task.points,
          isStory: task.isStory,
        } satisfies SnapshotTask,
      ]),
    ),
  };
  writeFileSync(snapshotPath(date), JSON.stringify(snapshot, null, 2), 'utf8');
  return snapshot;
}

export function readSnapshots(): Snapshot[] {
  let files: string[];
  try {
    files = readdirSync(settings.paths.snapshots).filter((name) => name.endsWith('.json')).sort();
  } catch {
    return [];
  }
  return files.map((file) => JSON.parse(readFileSync(join(settings.paths.snapshots, file), 'utf8')) as Snapshot);
}

/**
 * Rebuilds each story's timeline from consecutive snapshots. ClickUp's
 * `time_in_status` endpoint is unavailable on the team plan, so transitions are
 * observed with daily granularity. Completion still uses the exact
 * `date_closed` value, so only the start of the cycle carries 24h of error.
 */
export function buildTraces(tasks: ClickUpTask[], snapshots: Snapshot[]): StoryTrace[] {
  const ordered = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
  const stories = tasks.filter((task) => task.isStory);

  return stories.map((story) => {
    let readyAt: string | null = null;
    let inProgressAt: string | null = null;

    for (const snapshot of ordered) {
      const observed = snapshot.tasks[story.id];
      if (!observed) continue;
      if (!readyAt && observed.status === 'ready to do') readyAt = snapshot.date;
      if (!inProgressAt && observed.status === 'in progress') inProgressAt = snapshot.date;
    }

    const doneAt = story.dateClosed ? new Date(story.dateClosed).toISOString().slice(0, 10) : null;

    return {
      id: story.id,
      name: story.name,
      points: story.points,
      status: story.status,
      readyAt,
      inProgressAt,
      doneAt,
    };
  });
}

export function daysBetween(start: string, end: string): number {
  const from = Date.parse(`${start}T00:00:00Z`);
  const to = Date.parse(`${end}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000);
}
