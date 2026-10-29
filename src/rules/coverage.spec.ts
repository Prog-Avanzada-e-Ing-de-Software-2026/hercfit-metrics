import { describe, expect, it } from 'vitest';
import { extractTags } from './coverage.js';

describe('extraccion de tags de reglas', () => {
  it('extrae una regla del nombre del test', () => {
    expect(extractTags('[RN-09] no permite planes con fechas solapadas')).toEqual(['RN-09']);
  });

  it('extrae varias reglas del mismo test', () => {
    expect(extractTags('[RN-09][HU-1] rechaza solapamiento')).toEqual(['RN-09']);
  });

  it('devuelve vacio cuando el test no declara reglas', () => {
    expect(extractTags('valida el formato del DTO')).toEqual([]);
  });

  it('ignora identificadores con formato invalido', () => {
    expect(extractTags('[RN-9] formato viejo')).toEqual([]);
  });
});
