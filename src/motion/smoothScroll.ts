import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
export interface ScrollRuntime {
  lenis: Lenis;
  destroy: () => void;
}
export function initSmoothScroll(smoothWheel: boolean): ScrollRuntime {
  const lenis = new Lenis({
    duration: smoothWheel ? 0.75 : 0,
    smoothWheel,
    syncTouch: false,
    anchors: true,
  });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  const destroy = () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
  return { lenis, destroy };
}
