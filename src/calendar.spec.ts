import { describe, expect, it } from 'vitest';
import { activeDaysBetween, isActiveDay, weekOf } from './calendar.js';

describe('calendario del proyecto', () => {
  it('no cuenta la pausa programada de la semana 5 como dias activos', () => {
    // 2026-11-06 (viernes, semana 4) -> 2026-11-20 (viernes, semana 6).
    // La semana 5 completa (09/11 a 16/11) queda excluida.
    expect(activeDaysBetween('2026-11-06', '2026-11-20')).toBe(7);
  });

  it('cuenta dias activos entre semanas de desarrollo sin pausa', () => {
    expect(activeDaysBetween('2026-11-16', '2026-11-23')).toBe(7);
  });

  it('marca la semana 5 como inactiva', () => {
    const week = weekOf('2026-11-11');
    expect(week?.n).toBe(5);
    expect(week?.activa).toBe(false);
    expect(isActiveDay('2026-11-11')).toBe(false);
  });

  it('identifica las semanas de desarrollo', () => {
    expect(weekOf('2026-11-04')?.desarrollo).toBe(true);
    expect(weekOf('2026-10-28')?.desarrollo).toBe(false);
    expect(weekOf('2026-11-11')?.desarrollo).toBe(false);
  });

  it('devuelve cero si el rango esta invertido', () => {
    expect(activeDaysBetween('2026-11-20', '2026-11-06')).toBe(0);
  });
});
