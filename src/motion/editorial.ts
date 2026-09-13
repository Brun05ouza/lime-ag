import { gsap } from 'gsap';
import { revealText } from './revealText';
import { MOTION, entered, hasPassed, type Cleanup } from './tokens';
export function initEditorial(mobile: boolean): Cleanup {
  const cleanup: Cleanup[] = [];
  if (!mobile) {
    document
      .querySelectorAll<HTMLElement>('.partner-copy p, .value-columns h3, .team-profile h3')
      .forEach((el, index) =>
        cleanup.push(revealText(el, mobile, { type: 'words', delay: (index % 2) * 0.1 })),
      );
    document
      .querySelectorAll<HTMLElement>('.value-columns article, .next-steps li, .team-profile > p')
      .forEach((el) => {
        if (entered.has(el) || hasPassed(el)) return;
        const targets = el.matches('li') ? Array.from(el.children) : [el];
        gsap.from(targets, {
          y: 20,
          opacity: 0,
          duration: MOTION.medium,
          stagger: 0.12,
          ease: MOTION.easeOut,
          scrollTrigger: {
            trigger: el,
            start: 'top 86%',
            once: true,
            onEnter: () => entered.add(el),
          },
        });
      });
  }
  const work = document.querySelector<HTMLElement>('.work h2');
  if (work)
    cleanup.push(
      revealText(work, mobile, {
        duration: 1.2,
        stagger: 0.18,
        x: mobile ? 0 : 18,
        start: 'top 80%',
      }),
    );
  document
    .querySelectorAll<HTMLElement>('.metrics-track, .metrics-impact, .word-shift, .footer-bottom')
    .forEach((el) => {
      if (entered.has(el) || hasPassed(el)) return;
      gsap.fromTo(
        el,
        { '--rule-scale': 0 },
        {
          '--rule-scale': 1,
          duration: 1,
          ease: MOTION.easeStrong,
          scrollTrigger: {
            trigger: el,
            start: 'top 87%',
            once: true,
            onEnter: () => entered.add(el),
          },
        },
      );
    });
  const footer = document.querySelector('.site-footer');
  if (footer && !entered.has(footer) && !hasPassed(footer)) {
    gsap.from('.footer-top > *, .footer-bottom > *', {
      y: 15,
      opacity: 0,
      duration: MOTION.medium,
      stagger: 0.07,
      ease: MOTION.easeOut,
      scrollTrigger: {
        trigger: footer,
        start: 'top 93%',
        once: true,
        onEnter: () => entered.add(footer),
      },
    });
  }
  return () => cleanup.reverse().forEach((fn) => fn());
}
