import { gsap } from 'gsap';
import { revealText } from './revealText';
import { MOTION, entered, hasPassed, type Cleanup } from './tokens';
export function initCTA(mobile: boolean): Cleanup {
  const cleanup: Cleanup[] = [];
  document
    .querySelectorAll<HTMLElement>('.final-cta h2')
    .forEach((el) =>
      cleanup.push(
        revealText(el, mobile, {
          duration: 0.85,
          stagger: 0.06,
          start: mobile ? 'top 88%' : 'top 82%',
        }),
      ),
    );
  const button = document.querySelector<HTMLElement>('.cta-large');
  if (button && !entered.has(button) && !hasPassed(button)) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: button,
        start: mobile ? 'top 90%' : 'top 84%',
        once: true,
        onEnter: () => entered.add(button),
      },
    });
    tl.fromTo(
      button,
      { '--rule-scale': 0 },
      { '--rule-scale': 1, duration: 0.6, ease: 'power1.inOut' },
      0,
    )
      .from(
        button.querySelector('[data-button-label]'),
        { clipPath: 'inset(0 100% 0 0)', duration: 0.55, ease: MOTION.easeStrong },
        0.12,
      )
      .from(
        button.querySelector('.button-arrow'),
        { scale: 0, x: -12, opacity: 0, duration: 0.25 },
        0.5,
      );
  }
  return () => cleanup.forEach((fn) => fn());
}
