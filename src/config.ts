import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(here, '..');

// Loads .env when present so local runs do not need exported variables.
try {
  process.loadEnvFile(resolve(ROOT, '.env'));
} catch {
  // No .env file: rely on the process environment (CI).
}

export interface WeekWindow {
  n: number;
  desde: string;
  hasta: string;
  activa: boolean;
  desarrollo: boolean;
  foco?: string;
  motivo?: string;
}

export interface Calendar {
  proyecto: string;
  inicio: string;
  fin: string;
  semanas: WeekWindow[];
}

export const calendar: Calendar = JSON.parse(
  readFileSync(resolve(ROOT, 'config', 'calendario.json'), 'utf8'),
) as Calendar;

export const settings = {
  clickup: {
    listId: process.env.CLICKUP_LIST_ID ?? '901717994296',
    // Custom field "Tipo de Tarea"; the "Historia de Usuario" option has orderindex 1.
    taskTypeFieldId: '899fa61a-b3ff-4fc6-b255-e6cfe41e225b',
    storyOptionIndex: 1,
    token: process.env.CLICKUP_TOKEN ?? '',
  },
  github: {
    token: process.env.GH_PAT ?? process.env.GITHUB_TOKEN ?? '',
    repositories: [
      'Prog-Avanzada-e-Ing-de-Software-2026/Proyecto3_Back',
      'Prog-Avanzada-e-Ing-de-Software-2026/Proyecto3_Front',
    ],
    deploy: {
      repo: 'Prog-Avanzada-e-Ing-de-Software-2026/Proyecto3_Back',
      workflow: 'deploy_heroku.yml',
    },
    integrationBranch: 'develop',
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN ?? '',
    chatId: process.env.TELEGRAM_CHAT_ID ?? '',
  },
  thresholds: {
    // 1.1 Cycle Time, in days.
    cycleTime: { small: 4, large: 7 },
    // 1.2 Review rate, percentage.
    reviewRate: 70,
    // 3.1 Throughput: the weekly average must be at least this value.
    throughput: { min: 4 },
    // 3.2 Lead Time, active development days.
    leadTime: 14,
    // 2.1 Rule coverage, percentage.
    ruleCoverage: 100,
  },
  paths: {
    snapshots: resolve(ROOT, 'state', 'snapshots'),
    reports: resolve(ROOT, 'reports'),
    rules: resolve(ROOT, 'rules', 'reglas.json'),
  },
} as const;
