import { settings } from '../config.js';

interface WorkflowRun {
  updated_at: string;
  conclusion: string | null;
}

/**
 * GitHub does not create a Deployment record unless the job declares an
 * `environment`, and `permissions: deployments: write` alone is not enough.
 * The successful run of the deploy workflow is the real deployment event, so
 * the collector reads that instead of asking the team to change their workflow.
 */
export async function fetchDeployDates(): Promise<string[]> {
  const { repo, workflow } = settings.github.deploy;
  const response = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/runs?status=success&per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${settings.github.token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'hercfit-metrics',
      },
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub ${response.status} on deploy runs: ${(await response.text()).slice(0, 200)}`);
  }

  const payload = (await response.json()) as { workflow_runs?: WorkflowRun[] };
  return (payload.workflow_runs ?? [])
    .filter((run) => run.conclusion === 'success')
    .map((run) => run.updated_at.slice(0, 10))
    .sort();
}

/** First successful deployment on or after the story closed. */
export function firstDeployAfter(doneAt: string | null, deploys: string[]): string | null {
  if (!doneAt) return null;
  return deploys.find((date) => date >= doneAt) ?? null;
}
