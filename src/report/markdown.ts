import { settings } from '../config.js';
import type { WeekWindow } from '../config.js';
import type {
  CycleTimeResult,
  LeadTimeResult,
  ReviewRateResult,
  RuleCoverageResult,
  ThroughputResult,
} from '../types.js';

export interface ReportInput {
  week: WeekWindow | null;
  generatedAt: string;
  cycleTime: CycleTimeResult;
  throughput: ThroughputResult;
  leadTime: LeadTimeResult;
  reviewRate: ReviewRateResult | null;
  ruleCoverage: RuleCoverageResult | null;
  warnings: string[];
}

function mark(ok: boolean | null): string {
  if (ok === null) return 'sin datos';
  return ok ? 'OK' : 'ALERTA';
}

function number(value: number | null, suffix = ''): string {
  return value === null ? 'sin datos' : `${value}${suffix}`;
}

export function renderMarkdown(input: ReportInput): string {
  const { week, thresholds } = { week: input.week, thresholds: settings.thresholds };
  const lines: string[] = [];

  lines.push(`# Reporte de metricas HercFit`);
  lines.push('');
  lines.push(`Generado: ${input.generatedAt}`);
  lines.push(
    week
      ? `Semana ${week.n}: ${week.desde} a ${week.hasta}${week.activa ? '' : ' (pausa programada)'}`
      : 'Fuera del cronograma del proyecto',
  );
  if (week?.foco) lines.push('');
  if (week?.foco) lines.push(`Foco: ${week.foco}`);
  lines.push('');

  lines.push('## Resumen');
  lines.push('');
  lines.push('| Metrica | Valor | Umbral | Estado |');
  lines.push('| --- | --- | --- | --- |');
  lines.push(
    `| 1.1 Cycle Time | ${number(input.cycleTime.averageDays, ' d')} | 4 d (1-2 SP) / 7 d (5 SP) | ${mark(
      input.cycleTime.averageDays === null
        ? null
        : input.cycleTime.averageDays <= thresholds.cycleTime.large,
    )} |`,
  );
  lines.push(
    `| 1.2 Revision de PRs | ${number(input.reviewRate?.rate ?? null, ' %')} | >= ${thresholds.reviewRate} % | ${mark(
      input.reviewRate ? input.reviewRate.meetsTarget : null,
    )} |`,
  );
  lines.push(
    `| 2.1 Cobertura de reglas | ${
      input.ruleCoverage ? `${input.ruleCoverage.covered}/${input.ruleCoverage.total} (${input.ruleCoverage.percentage} %)` : 'sin datos'
    } | 100 % | ${mark(
      input.ruleCoverage ? input.ruleCoverage.percentage >= thresholds.ruleCoverage : null,
    )} |`,
  );
  lines.push(
    `| 3.1 Throughput | ${input.throughput.total} HUs | ${thresholds.throughput.min}-${thresholds.throughput.max} HUs | ${
      input.throughput.evaluated ? mark(input.throughput.meetsTarget) : 'no evaluada'
    } |`,
  );
  lines.push(
    `| 3.2 Lead Time | ${number(input.leadTime.averageActiveDays, ' d activos')} | < ${thresholds.leadTime} d activos | ${mark(
      input.leadTime.averageActiveDays === null
        ? null
        : input.leadTime.averageActiveDays < thresholds.leadTime,
    )} |`,
  );
  lines.push('');

  lines.push('## 1.1 Cycle Time');
  lines.push('');
  if (input.cycleTime.sample === 0) {
    lines.push('Sin historias completadas con inicio registrado. El snapshot diario arranca el historial desde la primera ejecucion.');
  } else {
    lines.push('| HU | SP | Dias | Umbral | Estado |');
    lines.push('| --- | --- | --- | --- | --- |');
    for (const item of input.cycleTime.items) {
      lines.push(
        `| ${item.name} | ${item.points ?? '-'} | ${item.days} | ${item.threshold} | ${item.exceeded ? 'excede' : 'OK'} |`,
      );
    }
  }
  if (input.cycleTime.openOverdue.length > 0) {
    lines.push('');
    lines.push('**En curso por encima del umbral:**');
    lines.push('');
    for (const item of input.cycleTime.openOverdue) {
      lines.push(`- ${item.name}: ${item.days} d en progreso (umbral ${item.threshold} d)`);
    }
  }
  lines.push('');

  lines.push('## 1.2 Tasa de revision de Pull Requests');
  lines.push('');
  if (!input.reviewRate) {
    lines.push('No se ejecuto: falta GH_PAT.');
  } else if (input.reviewRate.merged === 0) {
    lines.push('Sin Pull Requests mergeadas en el periodo. El indicador queda sin datos.');
  } else {
    lines.push('| Repositorio | Mergeadas | Con >= 2 aprobaciones |');
    lines.push('| --- | --- | --- |');
    for (const repo of input.reviewRate.repositories) {
      lines.push(`| ${repo.repo} | ${repo.merged} | ${repo.reviewed} |`);
    }
    lines.push('');
    lines.push(`Total: ${input.reviewRate.reviewed}/${input.reviewRate.merged} (${input.reviewRate.rate} %).`);
  }
  lines.push('');

  lines.push('## 2.1 Cobertura de reglas de negocio');
  lines.push('');
  if (!input.ruleCoverage) {
    lines.push('No se ejecuto: falta el reporte JSON de Vitest.');
  } else {
    lines.push(`${input.ruleCoverage.covered} de ${input.ruleCoverage.total} reglas verificadas por un test que pasa.`);
    if (input.ruleCoverage.missing.length > 0) {
      lines.push('');
      lines.push(`Sin test: ${input.ruleCoverage.missing.join(', ')}`);
    }
  }
  lines.push('');

  lines.push('## 3.1 Throughput');
  lines.push('');
  if (!input.throughput.evaluated) {
    lines.push('Semana sin foco de desarrollo: el indicador no se evalua.');
  } else if (input.throughput.total === 0) {
    lines.push('Sin historias completadas en la semana.');
  } else {
    for (const story of input.throughput.stories) {
      lines.push(`- ${story.name} (${story.doneAt})`);
    }
  }
  lines.push('');

  lines.push('## 3.2 Lead Time');
  lines.push('');
  lines.push('Dias activos entre el pase a "Ready to do" y el primer deploy exitoso posterior al cierre. La semana 5 del cronograma no cuenta.');
  lines.push('');
  if (input.leadTime.sample === 0) {
    lines.push('Sin historias medibles todavia.');
  } else {
    lines.push('| HU | Ready to do | Desplegada | Dias activos |');
    lines.push('| --- | --- | --- | --- |');
    for (const item of input.leadTime.items) {
      lines.push(
        `| ${item.name} | ${item.readyAt ?? '-'} | ${item.deployedAt ?? '-'} | ${item.activeDays ?? '-'} |`,
      );
    }
  }
  if (input.leadTime.exceeded.length > 0) {
    lines.push('');
    lines.push('**Por encima de 14 dias activos (requiere refinamiento y revision del WIP):**');
    lines.push('');
    for (const item of input.leadTime.exceeded) {
      lines.push(`- ${item.name}: ${item.activeDays} d`);
    }
  }
  lines.push('');

  if (input.warnings.length > 0) {
    lines.push('## Limitaciones de la corrida');
    lines.push('');
    for (const warning of input.warnings) lines.push(`- ${warning}`);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}
