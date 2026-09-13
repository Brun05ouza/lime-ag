import { gsap } from 'gsap';
export function initResults(mobile: boolean) {
  const section = document.querySelector('.results');
  if (!section) return;
  const large = section.querySelector('.metric--large');
  const top = section.querySelector('.metrics-track');
  const digital = section.querySelector('.metrics-digital');
  const impact = section.querySelector('.metrics-impact');
  if (!large || !top || !digital || !impact) return;
  if (mobile) {
    gsap.set(large, { y: 24, autoAlpha: 0, scale: 0.96 });
    gsap.to(large, {
      y: 0,
      autoAlpha: 1,
      scale: 1,
      transformOrigin: '0% 50%',
      duration: 1.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: large, start: 'top 86%', once: true },
    });
    gsap.set(digital.children, { y: 18, autoAlpha: 0 });
    gsap.to(digital.children, {
      y: 0,
      autoAlpha: 1,
      duration: 0.8,
      stagger: 0.07,
      ease: 'power3.out',
      scrollTrigger: { trigger: digital, start: 'top 88%', once: true },
    });
    return;
  }
  const label = large.querySelector('.metric-label');
  gsap.set(large, { scale: 0.86, transformOrigin: '0% 50%' });
  gsap.set(label, { x: 55, clipPath: 'inset(0 100% 0 0)' });
  gsap.set(digital.children, { x: 60, clipPath: 'inset(0 0 0 100%)' });
  const tl = gsap.timeline({
    scrollTrigger: { trigger: impact, start: 'top 94%', end: 'bottom 30%', scrub: 0.55 },
  });
  tl.to(large, { scale: 1, duration: 0.65, ease: 'power4.out' }, 0)
    .to(top, { scale: 0.95, opacity: 0.4, duration: 0.35 }, 0)
    .to(
      label,
      { x: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.4 },
      0.2,
    )
    .to(large, { x: mobile ? -5 : -35, duration: 0.3 }, 0.55)
    .to(
      digital.children,
      { x: 0, clipPath: 'inset(0 0 0 0%)', duration: 0.3, stagger: 0.05 },
      0.48,
    )
    .to({}, { duration: 0.55 });
}
