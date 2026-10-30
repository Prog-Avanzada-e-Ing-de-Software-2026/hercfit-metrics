import { settings } from '../config.js';
import type { ReportInput } from './markdown.js';

/**
 * Telegram gets only what needs attention plus the four headline numbers, so
 * the weekly report stays readable on a phone.
 */
export function buildTelegramMessage(input: ReportInput): string {
  const lines: string[] = [];
  const label = input.week ? `Semana ${input.week.n}` : 'Fuera de cronograma';
  lines.push(`HercFit - metricas (${label})`);

  const alerts: string[] = [];
  if (input.cycleTime.openOverdue.length > 0) {
    alerts.push(
      `Cycle Time: ${input.cycleTime.openOverdue.length} HU en progreso pasadas de umbral -> ${input.cycleTime.openOverdue
        .map((item) => `${item.name} (${item.days}d)`)
        .join(', ')}`,
    );
  }
  if (input.reviewRate && !input.reviewRate.meetsTarget && input.reviewRate.merged > 0) {
    alerts.push(`Revision de PRs en ${input.reviewRate.rate}% (objetivo ${settings.thresholds.reviewRate}%)`);
  }
  if (input.ruleCoverage && input.ruleCoverage.percentage < settings.thresholds.ruleCoverage) {
    alerts.push(
      `Cobertura de reglas en ${input.ruleCoverage.percentage}% (${input.ruleCoverage.covered}/${input.ruleCoverage.total})`,
    );
  }
  if (input.throughput.evaluated && !input.throughput.meetsTarget) {
    alerts.push(
      `Throughput: promedio ${input.throughput.average} HUs/semana (objetivo >= ${settings.thresholds.throughput.min})`,
    );
  }
  if (input.leadTime.exceeded.length > 0) {
    alerts.push(`Lead Time > ${settings.thresholds.leadTime} d activos en ${input.leadTime.exceeded.length} HU`);
  }

  if (alerts.length > 0) {
    lines.push('');
    lines.push('ALERTAS');
    for (const alert of alerts) lines.push(`- ${alert}`);
  } else {
    lines.push('');
    lines.push('Sin alertas.');
  }

  lines.push('');
  lines.push(`Cycle Time: ${input.cycleTime.averageDays ?? 'sin datos'} d`);
  lines.push(`Throughput: ${input.throughput.average ?? 'sin datos'} HUs/semana`);
  lines.push(`Lead Time: ${input.leadTime.averageActiveDays ?? 'sin datos'} d activos`);
  if (input.reviewRate) lines.push(`Revision PRs: ${input.reviewRate.rate ?? 'sin datos'}%`);
  if (input.ruleCoverage) lines.push(`Reglas: ${input.ruleCoverage.percentage}%`);

  return lines.join('\n');
}

export async function sendTelegram(input: ReportInput): Promise<boolean> {
  const { token, chatId } = settings.telegram;
  if (!token || !chatId) return false;

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: buildTelegramMessage(input) }),
  });

  if (!response.ok) {
    throw new Error(`Telegram ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
  return true;
}
