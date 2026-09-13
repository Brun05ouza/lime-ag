import { gsap } from 'gsap';
import { MOTION } from './tokens';
export function initCounters(mobile = false) {
  document.querySelectorAll<HTMLElement>('[data-counter]').forEach((element, index) => {
    const metric = element.closest<HTMLElement>('.metric');
    if (!metric) return;
    const value = Number(element.dataset.value);
    const final = element.dataset.final || '';
    const counter = { value: 0 };
    const large = metric.classList.contains('metric--large');
    const delay = large ? 0 : (index % 5) * 0.045;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: metric,
        start: large ? 'top 92%' : 'top 94%',
        ...(mobile
          ? { once: true }
          : {
              end: large ? 'top 38%' : 'top 44%',
              scrub: 0.8,
            }),
      },
    });
    if (index < 5)
      tl.from(
        metric,
        {
          y: 25,
          clipPath: 'inset(100% 0 0 0)',
          duration: 0.75,
          ease: large ? MOTION.easeExpo : MOTION.easeOut,
        },
        delay,
      );
    tl.to(
      counter,
      {
        value,
        duration: large ? 1.4 : 1.2,
        ease: mobile ? MOTION.easeOut : 'none',
        onUpdate: () => {
          let numeric = Number.isInteger(value)
            ? String(Math.round(counter.value))
            : counter.value.toFixed(1);
          if (final.startsWith('0')) numeric = numeric.padStart(2, '0');
          element.textContent = `${numeric}${element.dataset.suffix}`;
        },
        onComplete: () => {
          element.textContent = final;
        },
      },
      delay + 0.08,
    );
  });
  return () =>
    document.querySelectorAll<HTMLElement>('[data-counter]').forEach((el) => {
      el.textContent = el.dataset.final || '';
    });
}
