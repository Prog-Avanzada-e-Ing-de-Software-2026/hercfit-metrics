import { settings } from '../config.js';
import type { ClickUpTask } from '../types.js';

const API = 'https://api.clickup.com/api/v2';

interface RawCustomField {
  id: string;
  name: string;
  type: string;
  value: unknown;
}

interface RawTask {
  id: string;
  name: string;
  status?: { status?: string };
  points?: number | string | null;
  date_created?: string | null;
  date_closed?: string | null;
  custom_fields?: RawCustomField[];
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toMillis(value: string | null | undefined): number | null {
  const parsed = toNumber(value);
  return parsed === null ? null : parsed;
}

/**
 * ClickUp exposes the "Tipo de Tarea" dropdown value as the option order index.
 * The name prefix is used only as a fallback when the custom field is missing.
 */
function isStoryTask(task: RawTask): boolean {
  const field = task.custom_fields?.find((candidate) => candidate.id === settings.clickup.taskTypeFieldId);
  if (field) return toNumber(field.value) === settings.clickup.storyOptionIndex;
  return /^HU\s*\d+/i.test(task.name);
}

function normalize(task: RawTask): ClickUpTask {
  return {
    id: task.id,
    name: task.name,
    status: task.status?.status ?? 'unknown',
    points: toNumber(task.points),
    dateCreated: toMillis(task.date_created),
    dateClosed: toMillis(task.date_closed),
    isStory: isStoryTask(task),
  };
}

async function request<T>(path: string, attempt = 1): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: {
      Authorization: settings.clickup.token,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 429) {
    if (attempt > 5) throw new Error('ClickUp rate limit exceeded after 5 retries');
    const retryAfter = Number(response.headers.get('retry-after') ?? '1');
    await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter, 1) * 1000));
    return request<T>(path, attempt + 1);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ClickUp ${response.status} on ${path}: ${body.slice(0, 300)}`);
  }

  return (await response.json()) as T;
}

/**
 * The project board fits in a single page, but pagination is handled so the
 * collector keeps working as the backlog grows.
 */
export async function fetchListTasks(listId: string): Promise<ClickUpTask[]> {
  const tasks: ClickUpTask[] = [];
  for (let page = 0; page < 20; page += 1) {
    const payload = await request<{ tasks?: RawTask[]; last_page?: boolean }>(
      `/list/${listId}/task?include_closed=true&subtasks=true&page=${page}`,
    );
    const batch = payload.tasks ?? [];
    tasks.push(...batch.map(normalize));
    if (payload.last_page || batch.length === 0) break;
  }
  return tasks;
}
