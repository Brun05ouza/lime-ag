import { gsap } from 'gsap';
export function initCursor() {
  const cursor = document.querySelector<HTMLElement>('[data-cursor]');
  const glyph = cursor?.querySelector<HTMLElement>('span');
  if (!cursor || !glyph) return () => {};
  let activeTarget: Element | null = null;
  const reveal = (interactive: boolean) => {
    gsap.fromTo(glyph, {
      yPercent: 105,
      opacity: 0,
      scale: 0.82,
      rotation: interactive ? 10 : -10,
    }, {
      yPercent: 0,
      opacity: 1,
      scale: interactive ? 1.12 : 1,
      rotation: interactive ? -8 : 0,
      duration: 0.38,
      ease: 'power3.out',
      overwrite: true,
    });
  };
  const x = gsap.quickTo(cursor, 'x', { duration: 0.18 });
  const y = gsap.quickTo(cursor, 'y', { duration: 0.18 });
  const move = (event: PointerEvent) => {
    if (!(event.target instanceof Element)) return;
    if (event.pointerType !== 'mouse' || document.visibilityState !== 'visible') return;
    const entering = !cursor.classList.contains('is-visible');
    const target = event.target.closest('a, button, [data-magnetic], [data-cursor="view"]');
    cursor.classList.add('is-visible');
    cursor.classList.toggle('is-interactive', Boolean(target));
    cursor.classList.toggle('is-cta', Boolean(event.target.closest('[data-magnetic]')));
    const view = Boolean(event.target.closest('[data-cursor="view"]'));
    cursor.classList.toggle('is-view', view);
    cursor.classList.toggle('is-link', Boolean(event.target.closest('a,button')) && !view);
    if (entering || target !== activeTarget) {
      reveal(Boolean(target));
      activeTarget = target;
    }
    x(event.clientX + 15);
    y(event.clientY + 15);
  };
  const leave = () => {
    cursor.classList.remove('is-visible');
    activeTarget = null;
    gsap.killTweensOf(glyph);
  };
  const visibility = () => {
    if (document.visibilityState !== 'visible') leave();
  };
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerleave', leave);
  document.addEventListener('visibilitychange', visibility);
  return () => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerleave', leave);
    document.removeEventListener('visibilitychange', visibility);
    cursor.className = 'cursor';
    gsap.killTweensOf(glyph);
    gsap.set(glyph, { clearProps: 'transform,opacity' });
    x.tween.kill();
    y.tween.kill();
  };
}
