// Registro leve da instância ativa do Lenis. Permite que módulos fora do initMotion
// (como o manifesto de entrada) pausem/retomem o scroll sem importar Lenis ou GSAP.
import type Lenis from 'lenis';

let current: Lenis | undefined;

export function registerLenis(instance: Lenis | undefined) {
  current = instance;
}

export function getLenis() {
  return current;
}
