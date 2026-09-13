// Small bootstrap: GSAP is not fetched when the visitor requests reduced motion.
import type { Cleanup } from './tokens';
let disposeBootstrap: Cleanup | undefined;
export function bootMotion(): Cleanup {
  disposeBootstrap?.();
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let cleanup: Cleanup | undefined;
  let generation = 0;
  let disposed = false;
  let suspended = false;
  const stop = () => {
    generation++;
    cleanup?.();
    cleanup = undefined;
  };
  const start = async () => {
    stop();
    const current = generation;
    document.documentElement.dataset.motionStatus = preference.matches ? 'reduced' : 'loading';
    if (disposed || suspended || preference.matches) return;
    try {
      const module = await import('./initMotion');
      if (current === generation && !disposed && !suspended && !preference.matches) {
        cleanup = module.initMotion();
        document.documentElement.dataset.motionStatus = 'ready';
      }
    } catch (error) {
      document.documentElement.dataset.motionStatus = 'failed';
      if (import.meta.env.DEV) console.error('[Lime motion]', error);
      document.documentElement.classList.remove('motion-ready');
    }
  };
  const change = () => {
    void start();
  };
  const hide = () => {
    suspended = true;
    stop();
  };
  const show = (event: PageTransitionEvent) => {
    if (event.persisted) {
      suspended = false;
      void start();
    }
  };
  preference.addEventListener('change', change);
  window.addEventListener('pagehide', hide);
  window.addEventListener('pageshow', show);
  void start();
  const dispose = () => {
    disposed = true;
    stop();
    preference.removeEventListener('change', change);
    window.removeEventListener('pagehide', hide);
    window.removeEventListener('pageshow', show);
    if (disposeBootstrap === dispose) disposeBootstrap = undefined;
  };
  disposeBootstrap = dispose;
  return dispose;
}
