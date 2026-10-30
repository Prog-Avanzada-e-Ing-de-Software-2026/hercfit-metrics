import { settings } from '../config.js';

interface PullRequest {
  number: number;
  merged_at: string | null;
  base: { ref: string };
  body: string | null;
}

const STORY = /^\s*HU\s*:?\s*(\d+)\s*$/im;

/** Story number declared in the PR body as `HU: 3` (or `HU 3`). */
export function declaredStory(body: string | null): number | null {
  if (!body) return null;
  const match = body.match(STORY);
  return match ? Number(match[1]) : null;
}

async function api<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${settings.github.token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'hercfit-metrics',
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub ${response.status} on ${path}: ${(await response.text()).slice(0, 200)}`);
  }
  return (await response.json()) as T;
}

/**
 * Lead Time ends when the story is integrated into `develop`, so the source is
 * the merge date of the pull request that declares it. A story that touches
 * both repositories completes only with the later of the two merges.
 */
export async function fetchDevelopMerges(): Promise<Map<number, string>> {
  const merged = new Map<number, string>();

  for (const repo of settings.github.repositories) {
    for (let page = 1; page <= 10; page += 1) {
      const pulls = await api<PullRequest[]>(
        `/repos/${repo}/pulls?state=closed&base=develop&per_page=100&page=${page}`,
      );
      if (pulls.length === 0) break;

      for (const pull of pulls) {
        if (!pull.merged_at || pull.base.ref !== 'develop') continue;
        const story = declaredStory(pull.body);
        if (story === null) continue;
        const date = pull.merged_at.slice(0, 10);
        const previous = merged.get(story);
        if (!previous || date > previous) merged.set(story, date);
      }
    }
  }

  return merged;
}

export function storyNumberOf(name: string): number | null {
  const match = name.match(/^\s*HU\s*(\d+)/i);
  return match ? Number(match[1]) : null;
}
