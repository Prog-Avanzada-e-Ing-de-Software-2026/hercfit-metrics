import { describe, expect, it } from 'vitest';
import { firstDeployAfter } from './deployments.js';

describe('seleccion del deploy de una historia', () => {
  const deploys = ['2026-11-05', '2026-11-12', '2026-11-20'];

  it('toma el primer deploy posterior al cierre de la historia', () => {
    expect(firstDeployAfter('2026-11-06', deploys)).toBe('2026-11-12');
  });

  it('acepta un deploy el mismo dia del cierre', () => {
    expect(firstDeployAfter('2026-11-12', deploys)).toBe('2026-11-12');
  });

  it('devuelve null cuando todavia no hubo deploy posterior', () => {
    expect(firstDeployAfter('2026-11-25', deploys)).toBeNull();
  });

  it('devuelve null cuando la historia no cerro', () => {
    expect(firstDeployAfter(null, deploys)).toBeNull();
  });
});
