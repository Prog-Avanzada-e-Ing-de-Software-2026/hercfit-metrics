import { describe, expect, it } from 'vitest';
import { throughput } from './throughput.js';
import type { WeekWindow } from '../config.js';
import type { StoryTrace } from '../types.js';

function trace(name: string, doneAt: string | null): StoryTrace {
  return { id: name, name, points: 1, status: doneAt ? 'complete' : 'in progress', readyAt: null, inProgressAt: null, doneAt };
}

function week(n: number, desde: string, hasta: string, desarrollo: boolean): WeekWindow {
  return { n, desde, hasta, activa: true, desarrollo };
}

const weeks = [
  week(1, '2026-10-12', '2026-10-19', false),
  week(4, '2026-11-02', '2026-11-09', true),
  week(5, '2026-11-09', '2026-11-16', false),
  week(6, '2026-11-16', '2026-11-23', true),
];

describe('throughput promedio', () => {
  it('promedia solo semanas de desarrollo cerradas', () => {
    const traces = [
      trace('HU 1', '2026-11-03'),
      trace('HU 2', '2026-11-05'),
      trace('HU 3', '2026-11-07'),
      trace('HU 4', '2026-11-17'),
      trace('HU 5', '2026-11-18'),
      trace('HU 6', '2026-11-20'),
      trace('HU 7', '2026-11-21'),
      trace('HU 8', '2026-11-22'),
      trace('HU 9', '2026-11-22'),
    ];
    const result = throughput(traces, weeks, '2026-11-25');
    expect(result.weeks.map((w) => w.count)).toEqual([3, 6]);
    expect(result.average).toBe(4.5);
    expect(result.meetsTarget).toBe(true);
  });

  it('no evalua hasta que cierra la primera semana de desarrollo', () => {
    const result = throughput([trace('HU 1', '2026-11-03')], weeks, '2026-11-05');
    expect(result.evaluated).toBe(false);
    expect(result.average).toBeNull();
    expect(result.meetsTarget).toBe(true);
  });

  it('acepta un promedio exactamente igual al umbral', () => {
    const traces = [
      trace('HU 1', '2026-11-03'),
      trace('HU 2', '2026-11-04'),
      trace('HU 3', '2026-11-05'),
      trace('HU 4', '2026-11-06'),
      trace('HU 5', '2026-11-17'),
      trace('HU 6', '2026-11-18'),
      trace('HU 7', '2026-11-19'),
      trace('HU 8', '2026-11-20'),
    ];
    const result = throughput(traces, weeks, '2026-11-25');
    expect(result.average).toBe(4);
    expect(result.meetsTarget).toBe(true);
  });

  it('marca alerta cuando el promedio no supera el umbral', () => {
    const traces = [
      trace('HU 1', '2026-11-03'),
      trace('HU 2', '2026-11-17'),
      trace('HU 3', '2026-11-18'),
      trace('HU 4', '2026-11-19'),
    ];
    const result = throughput(traces, weeks, '2026-11-25');
    expect(result.average).toBe(2);
    expect(result.meetsTarget).toBe(false);
  });

  it('informa la semana en curso sin incluirla en el promedio', () => {
    const result = throughput([trace('HU 1', '2026-11-03')], weeks, '2026-11-05');
    expect(result.current?.count).toBe(1);
    expect(result.current?.development).toBe(true);
    expect(result.average).toBeNull();
  });
});
