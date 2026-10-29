import { readFileSync } from 'node:fs';
import { settings } from '../config.js';
import type { RuleCoverageResult } from '../types.js';

interface RulesFile {
  total: number;
  reglas: Array<{ id: string; concepto: string; texto: string }>;
}

interface VitestAssertion {
  fullName?: string;
  title?: string;
  status?: string;
}

interface VitestReport {
  testResults?: Array<{ assertionResults?: VitestAssertion[] }>;
}

const TAG = /\[(RN-\d{2})\]/g;

/** Rule identifiers declared in a test name, e.g. `[RN-09] no permite solapamientos`. */
export function extractTags(name: string): string[] {
  return [...name.matchAll(TAG)].map((match) => match[1]).filter((tag): tag is string => Boolean(tag));
}

export function loadRules(): RulesFile {
  return JSON.parse(readFileSync(settings.paths.rules, 'utf8')) as RulesFile;
}

/**
 * Rule coverage is semantic, not line based: a rule counts as covered when at
 * least one test tagged `[RN-nn]` passes. The tag lives in the test name so
 * Vitest reports it in `fullName` without extra tooling.
 */
export function ruleCoverage(reportPath: string): RuleCoverageResult {
  const rules = loadRules();
  const known = new Set(rules.reglas.map((rule) => rule.id));
  const report = JSON.parse(readFileSync(reportPath, 'utf8')) as VitestReport;

  const occurrences = new Map<string, number>();
  const covered = new Set<string>();

  for (const file of report.testResults ?? []) {
    for (const assertion of file.assertionResults ?? []) {
      const name = assertion.fullName ?? assertion.title ?? '';
      const tags = extractTags(name);
      if (tags.length === 0) continue;

      for (const tag of tags) {
        if (!known.has(tag)) continue;
        occurrences.set(tag, (occurrences.get(tag) ?? 0) + 1);
        if (assertion.status === 'passed') covered.add(tag);
      }
    }
  }

  const missing = rules.reglas.map((rule) => rule.id).filter((id) => !covered.has(id));
  const duplicated = [...occurrences.entries()].filter(([, count]) => count > 1).map(([id]) => id);
  const percentage = Math.round((covered.size / rules.total) * 1000) / 10;

  return { total: rules.total, covered: covered.size, percentage, missing, duplicated };
}
