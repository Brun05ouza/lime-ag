import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION } from './tokens';

export function initMethod() {
  const track = document.querySelector<HTMLElement>('.method-track');
  if (!track) return () => {};
  track.classList.add('is-enhanced');
  const number = track.querySelector('[data-method-number]');
  const progress = track.querySelector('[data-method-progress]');
  const steps = Array.from(track.querySelectorAll<HTMLElement>('[data-method-step]'));
  const context = gsap.context(() => {}, track);
  let active = -1;

  const activate = (index: number, immediate = false) => {
    if (active === index) return;
    active = index;
    if (number) number.textContent = String(index + 1).padStart(2, '0');
    context.add(() =>
      steps.forEach((step, i) => {
        step.classList.toggle('is-current', i === index);
        gsap.to(step, {
          opacity: i === index ? 1 : 0.3,
          duration: immediate ? 0 : MOTION.fast,
          overwrite: 'auto',
        });
        gsap.to(step.querySelector('h3'), {
          x: i === index ? 0 : -10,
          duration: immediate ? 0 : MOTION.fast,
          overwrite: 'auto',
        });
      }),
    );
  };

  const progressTrigger = ScrollTrigger.create({
    trigger: track,
    start: 'top 70%',
    end: 'bottom 62%',
    onUpdate: () => {
      const index = steps.reduce(
        (current, step, i) =>
          step.getBoundingClientRect().top < window.innerHeight * 0.64 ? i : current,
        0,
      );
      activate(index);
    },
  });
  const initial = steps.reduce(
    (current, step, i) =>
      step.getBoundingClientRect().top < window.innerHeight * 0.64 ? i : current,
    0,
  );
  activate(initial, true);

  if (progress)
    gsap.fromTo(
      progress,
      { scaleY: 0.025 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: track,
          start: 'top 70%',
          end: 'bottom 62%',
          scrub: 0.65,
        },
      },
    );

  return () => {
    progressTrigger.kill();
    context.revert();
    track.classList.remove('is-enhanced');
    steps.forEach((step) => step.classList.remove('is-current'));
    if (number) number.textContent = '01';
  };
}
