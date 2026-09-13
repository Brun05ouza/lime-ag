import { gsap } from 'gsap';
import { MOTION } from './tokens';
export function initMagnetic() {
  const cleanups: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((element) => {
    const label = element.querySelector<HTMLElement>('[data-button-label]');
    const arrow = element.querySelector<HTMLElement>('.button-arrow');
    const glyph = element.querySelector<HTMLElement>('[data-arrow-glyph]');
    const targets = [
      { el: element, max: 10 },
      { el: label, max: 3 },
      { el: arrow, max: 5 },
    ].filter((item): item is { el: HTMLElement; max: number } => Boolean(item.el));
    const movers = targets.map(({ el, max }) => ({
      max,
      x: gsap.quickTo(el, 'x', { duration: 0.4, ease: MOTION.easeOut }),
      y: gsap.quickTo(el, 'y', { duration: 0.4, ease: MOTION.easeOut }),
    }));
    const context = gsap.context(() => {}, element);
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = element.getBoundingClientRect();
      const dx = gsap.utils.clamp(
        -1,
        1,
        (event.clientX - rect.left - rect.width / 2) / (rect.width / 2),
      );
      const dy = gsap.utils.clamp(
        -1,
        1,
        (event.clientY - rect.top - rect.height / 2) / (rect.height / 2),
      );
      movers.forEach((m) => {
        m.x(dx * m.max);
        m.y(dy * m.max);
      });
    };
    const leave = () =>
      movers.forEach((m) => {
        m.x(0);
        m.y(0);
      });
    const enter = () => {
      if (glyph)
        context.add(() => {
          gsap.killTweensOf(glyph);
          gsap
            .timeline()
            .to(glyph, { xPercent: 120, yPercent: -120, duration: 0.16 })
            .set(glyph, { xPercent: -120, yPercent: 120 })
            .to(glyph, { xPercent: 0, yPercent: 0, duration: 0.25, ease: MOTION.easeOut });
        });
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', leave);
    element.addEventListener('pointerenter', enter);
    cleanups.push(() => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', leave);
      element.removeEventListener('pointerenter', enter);
      movers.forEach((m) => {
        m.x.tween.kill();
        m.y.tween.kill();
      });
      context.revert();
      targets.forEach(({ el }) => gsap.set(el, { clearProps: 'transform' }));
    });
  });
  return () => cleanups.forEach((fn) => fn());
}
