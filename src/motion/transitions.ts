import { gsap } from 'gsap';
import { MOTION } from './tokens';
export function initTransitions(mobile: boolean) {
  const paper = document.querySelector('.problem');
  if (paper)
    mobile
      ? gsap.from(paper, {
          y: 24,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: paper, start: 'top 88%', once: true },
        })
      : gsap.fromTo(
          paper,
          { y: 60 },
          {
            y: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: paper,
              start: 'top bottom',
              end: 'top 65%',
              scrub: 0.7,
            },
          },
        );
  document.querySelectorAll<HTMLElement>('[data-section-wipe]').forEach((section) => {
    if (mobile) {
      gsap.fromTo(
        section,
        { '--wipe-scale': 1 },
        {
          '--wipe-scale': 0,
          duration: 0.8,
          ease: MOTION.easeStrong,
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            once: true,
          },
        },
      );
      return;
    }
    gsap.fromTo(
      section,
      { '--wipe-scale': 1 },
      {
        '--wipe-scale': 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: mobile ? 'top 82%' : 'top 70%',
          scrub: MOTION.scrub,
        },
      },
    );
  });
}
