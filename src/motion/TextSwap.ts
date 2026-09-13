import { gsap } from 'gsap';
// The original items stay in the document; enhanced composition reserves their full height.
export function textSwap(stage: HTMLElement, mobile: boolean) {
  const items = Array.from(stage.querySelectorAll<HTMLElement>('[data-swap-item]'));
  if (items.length < 2) return () => {};
  const height = stage.getBoundingClientRect().height;
  gsap.set(stage, { minHeight: height, position: 'relative' });
  gsap.set(items, { display: 'block' });
  gsap.set(items, { position: 'absolute', left: 0, right: 0, top: 0 });
  const breaks = Array.from(stage.querySelectorAll('br'));
  gsap.set(breaks, { display: 'none' });
  gsap.set(items.slice(1), { yPercent: 110, clipPath: 'inset(0 0 100% 0)' });
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: stage,
      start: 'top 82%',
      end: mobile ? 'top 32%' : 'top 20%',
      scrub: mobile ? 0.55 : 0.65,
    },
  });
  items.forEach((item, i) => {
    if (i)
      tl.to(
        item,
        { yPercent: 0, clipPath: 'inset(0 0 0% 0)', duration: 0.42, ease: 'power3.inOut' },
        i * 0.28,
      );
    if (i < items.length - 1)
      tl.to(
        item,
        { yPercent: -100, clipPath: 'inset(100% 0 0 0)', duration: 0.35, ease: 'power3.inOut' },
        (i + 1) * 0.28 + 0.08,
      );
  });
  tl.to({}, { duration: 0.57 });
  return () => tl.kill();
}
