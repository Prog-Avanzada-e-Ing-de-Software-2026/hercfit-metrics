import { describe, expect, it } from 'vitest';
import { declaredStory, storyNumberOf } from './merges.js';

describe('declaracion de la historia en el PR', () => {
  it('lee la linea HU con dos puntos', () => {
    expect(declaredStory('Implementa el alta\n\nHU: 8\nReglas: RN-17, RN-20')).toBe(8);
  });

  it('acepta la forma sin dos puntos', () => {
    expect(declaredStory('HU 3')).toBe(3);
  });

  it('devuelve null cuando no se declara', () => {
    expect(declaredStory('Sin historia asociada')).toBeNull();
    expect(declaredStory(null)).toBeNull();
  });
});

describe('numero de historia desde el nombre de la tarjeta', () => {
  it('extrae el numero del prefijo HU', () => {
    expect(storyNumberOf('HU 1 - Registrar plan de entrenamiento')).toBe(1);
    expect(storyNumberOf('HU 13 - Consultar evolucion por ejercicio')).toBe(13);
  });

  it('devuelve null para tareas que no son historias', () => {
    expect(storyNumberOf('Plan de pruebas')).toBeNull();
  });
});
