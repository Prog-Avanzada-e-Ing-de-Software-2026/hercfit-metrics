import { settings } from '../config.js';
import type { ReviewRateResult } from '../types.js';

interface PullRequest {
  number: number;
  user: { login: string; type?: string } | null;
  merged_at: string | null;
}

interface Review {
  user: { login: string; type?: string } | null;
  state: string;
  submitted_at: string;
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

function isBot(login: string): boolean {
  return login.endsWith('[bot]') || login.endsWith('-bot');
}

/** Latest review state per human reviewer; a later CHANGES_REQUESTED overrides an APPROVED. */
function approvers(reviews: Review[], author: string): Set<string> {
  const latest = new Map<string, { state: string; at: string }>();
  for (const review of reviews) {
    const login = review.user?.login;
    if (!login || login === author || isBot(login)) continue;
    const previous = latest.get(login);
    if (!previous || review.submitted_at > previous.at) {
      latest.set(login, { state: review.state, at: review.submitted_at });
    }
  }
  return new Set(
    [...latest.entries()].filter(([, value]) => value.state === 'APPROVED').map(([login]) => login),
  );
}

export async function reviewRate(start: string, end: string): Promise<ReviewRateResult> {
  const repositories: ReviewRateResult['repositories'] = [];
  let merged = 0;
  let reviewed = 0;

  for (const repo of settings.github.repositories) {
    let repoMerged = 0;
    let repoReviewed = 0;

    for (let page = 1; page <= 10; page += 1) {
      const pullRequests = await api<PullRequest[]>(
        `/repos/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=${page}`,
      );
      if (pullRequests.length === 0) break;

      let reachedWindowStart = false;
      for (const pullRequest of pullRequests) {
        if (!pullRequest.merged_at) continue;
        const mergedAt = pullRequest.merged_at.slice(0, 10);
        if (mergedAt >= end) continue;
        if (mergedAt < start) {
          reachedWindowStart = true;
          continue;
        }

        repoMerged += 1;
        const reviews = await api<Review[]>(`/repos/${repo}/pulls/${pullRequest.number}/reviews?per_page=100`);
        const approved = approvers(reviews, pullRequest.user?.login ?? '');
        if (approved.size >= 2) repoReviewed += 1;
      }

      if (reachedWindowStart) break;
    }

    repositories.push({ repo, merged: repoMerged, reviewed: repoReviewed });
    merged += repoMerged;
    reviewed += repoReviewed;
  }

  const rate = merged > 0 ? Math.round((reviewed / merged) * 1000) / 10 : null;

  return {
    merged,
    reviewed,
    rate,
    meetsTarget: rate !== null && rate >= settings.thresholds.reviewRate,
    repositories,
  };
}
