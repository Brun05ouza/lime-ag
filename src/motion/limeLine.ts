import { gsap } from 'gsap';
import { visibleLimePath } from './viewport';
export function initLimeLine(mobile: boolean) {
  document.querySelectorAll<SVGElement>('.lime-line').forEach((line) => {
    if (line.closest('.hero') || line.closest('[data-entry-manifesto]')) return;
    if (mobile && line.closest('.problem')) return;
    const path = visibleLimePath(line);
    if (!path) return;
    const length = path.getTotalLength();
    gsap.fromTo(
      path,
      { strokeDasharray: length, strokeDashoffset: length },
      {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: path.closest('section'),
          start: 'top 82%',
          end: 'top 38%',
          scrub: mobile ? 0.4 : 0.8,
        },
      },
    );
  });
}
