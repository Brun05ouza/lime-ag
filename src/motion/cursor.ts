import { gsap } from 'gsap';
export function initCursor() {
  const cursor = document.querySelector<HTMLElement>('[data-cursor]');
  if (!cursor) return () => {};
  const x = gsap.quickTo(cursor, 'x', { duration: 0.18 });
  const y = gsap.quickTo(cursor, 'y', { duration: 0.18 });
  const move = (event: PointerEvent) => {
    if (!(event.target instanceof Element)) return;
    if (event.pointerType !== 'mouse' || document.visibilityState !== 'visible') return;
    cursor.classList.add('is-visible');
    cursor.classList.toggle('is-cta', Boolean(event.target.closest('[data-magnetic]')));
    const view = Boolean(event.target.closest('[data-cursor="view"]'));
    cursor.classList.toggle('is-view', view);
    cursor.classList.toggle('is-link', Boolean(event.target.closest('a,button')) && !view);
    cursor.textContent = view ? 'VIEW' : '';
    x(event.clientX + 15);
    y(event.clientY + 15);
  };
  const leave = () => cursor.classList.remove('is-visible');
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
    x.tween.kill();
    y.tween.kill();
  };
}
