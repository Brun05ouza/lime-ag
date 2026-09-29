// Registro leve da instância ativa do Lenis para módulos que precisam
// pausar/retomar o scroll sem recriar a instância.
import type Lenis from 'lenis';

let current: Lenis | undefined;

export function registerLenis(instance: Lenis | undefined) {
  current = instance;
}

export function getLenis() {
  return current;
}
