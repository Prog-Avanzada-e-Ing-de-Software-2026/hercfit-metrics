import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { calendar, settings } from './config.js';
import { currentWeek, isoDate } from './calendar.js';
import { fetchListTasks } from './clickup/client.js';
import { buildTraces, readSnapshots, writeSnapshot } from './snapshot.js';
import { cycleTime } from './metrics/cycle-time.js';
import { throughput } from './metrics/throughput.js';
import { leadTime } from './metrics/lead-time.js';
import { reviewRate } from './github/review-rate.js';
import { fetchDevelopMerges } from './github/merges.js';
import { ruleCoverage } from './rules/coverage.js';
import { renderMarkdown } from './report/markdown.js';
import type { ReportInput } from './report/markdown.js';
import { sendTelegram } from './report/telegram.js';

function reportName(n: number): string {
  return `W${String(n).padStart(2, '0')}`;
}

async function main(): Promise<void> {
  if (!settings.clickup.token) {
    throw new Error('Falta CLICKUP_TOKEN.');
  }

  const snapshotOnly = process.argv.includes('--snapshot-only');
  const tasks = await fetchListTasks(settings.clickup.listId);
  const snapshot = writeSnapshot(tasks);
  console.log(`Snapshot ${snapshot.date}: ${tasks.length} tareas (${tasks.filter((task) => task.isStory).length} HUs).`);

  if (snapshotOnly) return;

  const traces = buildTraces(tasks, readSnapshots());
  const week = currentWeek();
  const today = isoDate(new Date());
  const bounds = week ? { start: week.desde, end: week.hasta } : { start: isoDate(new Date(Date.now() - 7 * 86_400_000)), end: today };

  const warnings: string[] = [
    'El Cycle Time arranca con el primer snapshot diario: el inicio de una HU tiene precision de 1 dia.',
  ];

  const cycle = cycleTime(traces, today);
  const flow = throughput(traces, calendar.semanas, today);

  let merges = new Map<number, string>();
  if (settings.github.token) {
    try {
      merges = await fetchDevelopMerges();
      console.log(`Historias integradas en ${settings.github.integrationBranch}: ${merges.size}.`);
    } catch (error) {
      warnings.push(`No se pudieron leer los merges a ${settings.github.integrationBranch}: ${(error as Error).message}`);
    }
  }
  if (merges.size === 0) {
    warnings.push(
      `Sin merges a ${settings.github.integrationBranch} con la historia declarada: el Lead Time queda sin datos. Cada PR debe incluir una linea "HU: <n>".`,
    );
  }

  const lead = leadTime(traces, merges);

  let review = null;
  if (settings.github.token) {
    try {
      review = await reviewRate(bounds.start, bounds.end);
    } catch (error) {
      warnings.push(`No se pudo calcular la tasa de revision: ${(error as Error).message}`);
    }
  } else {
    warnings.push('Tasa de revision de PRs omitida: falta GH_PAT o GITHUB_TOKEN.');
  }

  let rules = null;
  const resultsPath = process.env.VITEST_RESULTS;
  if (resultsPath && existsSync(resultsPath)) {
    rules = ruleCoverage(resultsPath);
  } else {
    warnings.push('Cobertura de reglas omitida: no se encontro el reporte JSON de Vitest.');
  }

  const input: ReportInput = {
    week,
    generatedAt: new Date().toISOString(),
    cycleTime: cycle,
    throughput: flow,
    leadTime: lead,
    reviewRate: review,
    ruleCoverage: rules,
    warnings,
  };

  mkdirSync(settings.paths.reports, { recursive: true });
  const name = week ? reportName(week.n) : `W${today}`;
  const markdownPath = join(settings.paths.reports, `${name}.md`);
  writeFileSync(markdownPath, renderMarkdown(input), 'utf8');
  writeFileSync(join(settings.paths.reports, `${name}.json`), JSON.stringify(input, null, 2), 'utf8');
  console.log(`Reporte: ${markdownPath}`);

  // A Telegram outage must not fail the metrics job: the report is already written.
  try {
    const sent = await sendTelegram(input);
    if (sent) console.log('Telegram: enviado.');
  } catch (error) {
    console.warn(`Telegram: no se pudo enviar (${(error as Error).message}).`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
