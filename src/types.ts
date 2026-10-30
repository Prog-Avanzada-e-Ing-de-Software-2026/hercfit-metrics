export type Status =
  | 'planning'
  | 'ready to do'
  | 'in progress'
  | 'in review'
  | 'complete'
  | string;

export interface ClickUpTask {
  id: string;
  name: string;
  status: Status;
  points: number | null;
  dateCreated: number | null;
  dateClosed: number | null;
  isStory: boolean;
}

export interface SnapshotTask {
  id: string;
  name: string;
  status: Status;
  points: number | null;
  isStory: boolean;
}

export interface Snapshot {
  date: string;
  takenAt: string;
  tasks: Record<string, SnapshotTask>;
}

export interface StoryTrace {
  id: string;
  name: string;
  points: number | null;
  status: Status;
  readyAt: string | null;
  inProgressAt: string | null;
  doneAt: string | null;
}

export interface CycleTimeResult {
  averageDays: number | null;
  sample: number;
  items: Array<{
    id: string;
    name: string;
    points: number | null;
    days: number;
    exceeded: boolean;
    threshold: number;
  }>;
  openOverdue: Array<{
    id: string;
    name: string;
    points: number | null;
    days: number;
    threshold: number;
  }>;
}

export interface ThroughputWeek {
  n: number;
  start: string;
  end: string;
  count: number;
}

export interface ThroughputResult {
  /** Stories closed during the currently running week, for context only. */
  current: { start: string; end: string; count: number; development: boolean } | null;
  /** Completed development weeks: the sample behind the average. */
  weeks: ThroughputWeek[];
  average: number | null;
  meetsTarget: boolean;
  evaluated: boolean;
}

export interface LeadTimeResult {
  averageActiveDays: number | null;
  sample: number;
  items: Array<{
    id: string;
    name: string;
    storyNumber: number | null;
    readyAt: string | null;
    integratedAt: string | null;
    activeDays: number | null;
  }>;
  exceeded: Array<{ id: string; name: string; activeDays: number }>;
}

export interface ReviewRateResult {
  merged: number;
  reviewed: number;
  rate: number | null;
  meetsTarget: boolean;
  repositories: Array<{ repo: string; merged: number; reviewed: number }>;
}

export interface RuleCoverageResult {
  total: number;
  covered: number;
  percentage: number;
  missing: string[];
  duplicated: string[];
}
