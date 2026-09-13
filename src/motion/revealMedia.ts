import { gsap } from 'gsap';
import { type Cleanup } from './tokens';
import { getProfile } from './viewport';
import { createImageReveal } from './imageReveal';
export function initRevealMedia(mobile: boolean): Cleanup {
  const animations: gsap.core.Animation[] = [];
  const cleanups: Cleanup[] = [];
  const profile = getProfile();
  document.querySelectorAll<HTMLElement>('[data-reveal-media]').forEach((element, index) => {
    const picture = element.querySelector('picture');
    const teamGrid = element.closest('.team-grid');
    cleanups.push(
      createImageReveal({
        wrapper: element,
        image: picture,
        trigger: element,
        clipPath: teamGrid ? 'inset(100% 0% 0% 0%)' : index % 2 ? 'inset(0 100% 0 0)' : 'inset(0 0 100% 0)',
        finalClipPath: teamGrid ? 'inset(0% 0% 0% 0%)' : undefined,
        start: teamGrid ? (mobile ? 'top 90%' : 'top 82%') : mobile ? 'top 90%' : 'top 98%',
        duration: teamGrid ? (mobile ? 1.05 : 1.2) : mobile ? 0.78 : 0.95,
        initialScale: teamGrid ? 1.06 : 1.04,
        finalScale: teamGrid ? 1.02 : 1,
        delay: 0,
      }),
    );
  });
  document.querySelectorAll<HTMLElement>('[data-editorial-media]').forEach((element, index) => {
    const amplitude = profile.parallax;
    if (!amplitude) return;
    const tween = gsap.fromTo(
      element,
      { yPercent: index % 2 ? -amplitude / 2 : amplitude / 2 },
      {
        yPercent: index % 2 ? amplitude : -amplitude,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: element.closest('section') || element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: mobile ? 0.4 : 0.8,
        },
      },
    );
    animations.push(tween);
  });
  return () => {
    cleanups.reverse().forEach((cleanup) => cleanup());
    animations.reverse().forEach((animation) => animation.kill());
  };
}
