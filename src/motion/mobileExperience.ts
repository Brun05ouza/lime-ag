import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Cleanup } from './tokens';

function initMobileProcess(): Cleanup {
  const method = document.querySelector<HTMLElement>('.method');
  if (!method) return () => {};
  const track = method.querySelector<HTMLElement>('.method-track');
  const steps = Array.from(method.querySelectorAll<HTMLElement>('[data-method-step]'));
  if (!track || !steps.length) return () => {};
  const rollingNumber = method.querySelector<HTMLElement>('[data-method-number]');

  const triggers: ScrollTrigger[] = [];
  const animations: gsap.core.Animation[] = [];
  let numberTween: gsap.core.Timeline | undefined;
  let active = 0;
  const setActive = (index: number, immediate = false) => {
    if (!immediate && active === index) return;
    active = index;
    steps.forEach((step, stepIndex) => {
      step.classList.toggle('is-current', stepIndex === index);
      step.classList.toggle('is-past', stepIndex < index);
    });
    if (!rollingNumber) return;
    const value = String(index + 1).padStart(2, '0');
    if (immediate) {
      rollingNumber.textContent = value;
      return;
    }
    numberTween?.kill();
    numberTween = gsap
      .timeline()
      .to(rollingNumber, { yPercent: -100, opacity: 0, duration: 0.14, ease: 'power2.in' })
      .call(() => {
        rollingNumber.textContent = value;
        gsap.set(rollingNumber, { yPercent: 100 });
      })
      .to(rollingNumber, { yPercent: 0, opacity: 1, duration: 0.22, ease: 'power3.out' });
  };
  setActive(0, true);

  const progress = gsap.fromTo(
    track,
    { '--mobile-process-progress': 0 },
    {
      '--mobile-process-progress': 1,
      ease: 'none',
      scrollTrigger: {
        trigger: track,
        start: 'top 78%',
        end: 'bottom 70%',
        scrub: 0.4,
      },
    },
  );

  steps.forEach((step, index) => {
    const eyebrow = step.querySelector<HTMLElement>('.eyebrow');
    const title = step.querySelector<HTMLElement>('h3');
    const body = step.querySelector<HTMLElement>('p');
    if (eyebrow && title && body)
      animations.push(
        gsap
          .timeline({
            scrollTrigger: { trigger: step, start: 'top 86%', once: true },
          })
          .from(eyebrow, { scale: 0.9, opacity: 0, duration: 0.38, ease: 'power3.out' })
          .from(title, { x: 10, opacity: 0, duration: 0.55, ease: 'power3.out' }, 0.08)
          .from(body, { y: 10, opacity: 0.5, duration: 0.45, ease: 'power3.out' }, 0.18),
      );
    triggers.push(
      ScrollTrigger.create({
        trigger: step,
        start: 'top 78%',
        end: 'bottom 45%',
        onEnter: () => setActive(index),
        onEnterBack: () => setActive(index),
        onLeave: () => {
          step.classList.remove('is-current');
          step.classList.add('is-past');
        },
      }),
    );
  });

  return () => {
    progress.kill();
    numberTween?.kill();
    animations.reverse().forEach((animation) => animation.kill());
    triggers.forEach((trigger) => trigger.kill());
    steps.forEach((step) => step.classList.remove('is-current', 'is-past'));
  };
}

function initMobileHeaderScenes(): Cleanup {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const finalCTA = document.querySelector<HTMLElement>('.final-cta');
  if (!header || !finalCTA) return () => {};

  const trigger = ScrollTrigger.create({
    trigger: finalCTA,
    start: 'top 86%',
    endTrigger: document.body,
    end: 'bottom bottom',
    onEnter: () => header.classList.add('is-mobile-suppressed'),
    onLeaveBack: () => header.classList.remove('is-mobile-suppressed'),
  });

  return () => {
    trigger.kill();
    header.classList.remove('is-mobile-suppressed');
  };
}

export function initMobileExperience(): Cleanup {
  const cleanups = [initMobileProcess(), initMobileHeaderScenes()];
  return () => cleanups.reverse().forEach((cleanup) => cleanup());
}
