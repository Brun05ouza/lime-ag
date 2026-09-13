import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { MOTION, entered, hasPassed, type Cleanup } from './tokens';
interface Options {
  delay?: number;
  stagger?: number;
  start?: string;
  type?: 'lines' | 'words';
  x?: number;
  duration?: number;
}
export function revealText(element: HTMLElement, mobile: boolean, options: Options = {}): Cleanup {
  if (entered.has(element) || hasPassed(element)) {
    entered.add(element);
    return () => {};
  }
  const type = options.type || 'lines';
  const split = SplitText.create(element, {
    type: type === 'words' ? 'lines,words' : 'lines',
    mask: 'lines',
    linesClass: 'reveal-line',
    autoSplit: true,
    onSplit(self) {
      if (entered.has(element)) return gsap.set(self[type], { clearProps: 'all' });
      gsap.set(self[type], {
        yPercent: 110,
        autoAlpha: 0,
        rotation: 2,
        x: options.x || 0,
      });
      return gsap.to(self[type], {
        yPercent: 0,
        autoAlpha: 1,
        rotation: 0,
        x: 0,
        duration: options.duration || (mobile ? MOTION.mobile : MOTION.slow),
        delay: mobile ? Math.min(options.delay || 0, 0.1) : options.delay || 0,
        stagger: options.stagger || (mobile ? MOTION.mobileStagger : MOTION.stagger),
        ease: MOTION.easeStrong,
        scrollTrigger: {
          trigger: element,
          start: options.start || (mobile ? 'top 88%' : 'top 84%'),
          once: true,
          onEnter: () => entered.add(element),
        },
      });
    },
  });
  return () => split.revert();
}
export function initTextReveals(mobile: boolean): Cleanup {
  const cleanup: Cleanup[] = [];
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
    if (element.closest('[data-section-motion]')) return;
    if (mobile && element.hasAttribute('data-mobile-motion')) return;
    if (element.dataset.reveal === 'fade' || !element.dataset.reveal) {
      if (entered.has(element) || hasPassed(element)) return;
      gsap.set(element, { y: 20, autoAlpha: 0 });
      const animation = gsap.to(element, {
        y: 0,
        autoAlpha: 1,
        duration: MOTION.medium,
        ease: MOTION.easeOut,
        scrollTrigger: {
          trigger: element,
          start: mobile ? 'top 90%' : 'top 88%',
          once: true,
          onEnter: () => entered.add(element),
        },
      });
      cleanup.push(() => animation.kill());
    } else
      cleanup.push(
        revealText(element, mobile, {
          type: element.dataset.reveal === 'words' ? 'words' : 'lines',
        }),
      );
  });
  return () => cleanup.reverse().forEach((fn) => fn());
}
