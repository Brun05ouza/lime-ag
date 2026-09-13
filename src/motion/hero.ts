import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION, entered } from './tokens';
import { addHeaderIntro } from './header';
import { getProfile, visibleLimePath } from './viewport';
export function initHero(mobile: boolean) {
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!hero) return () => {};
  const narrow = window.matchMedia('(max-width: 767px)').matches;
  const words = Array.from(hero.querySelectorAll<HTMLElement>('[data-hero-line]'));
  const path = visibleLimePath(hero);
  const title = hero.querySelector('h1');
  const profile = getProfile();
  let intro: gsap.core.Timeline | undefined;
  if (!entered.has(hero) && window.scrollY < 80 && words.length === 4) {
    entered.add(hero);
    intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
    addHeaderIntro(intro, mobile);
    const strategy = hero.querySelector<HTMLElement>('[data-hero-strategy]');
    const purpose = hero.querySelector<HTMLElement>('[data-hero-purpose]');
    if (narrow) {
      intro
        .from(
          '.hero-intro > *',
          { y: -8, opacity: 0, duration: 0.45, stagger: 0.04, ease: 'power3.out' },
          0.05,
        )
        .fromTo(
          words[0],
          { xPercent: -6, scale: 1.05, clipPath: 'inset(0 100% 0 0)' },
          { xPercent: 0, scale: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.72 },
          0.18,
        )
        .from(
          words[1],
          { x: 10, clipPath: 'inset(0 0 0 100%)', duration: 0.58, ease: 'power3.out' },
          0.42,
        )
        .fromTo(
          strategy,
          { backgroundPosition: '100% 50%' },
          { backgroundPosition: '0% 50%', duration: 0.58, ease: 'power3.inOut' },
          0.5,
        );
      if (path) {
        const total = path.getTotalLength();
        intro.fromTo(
          path,
          { strokeDasharray: total, strokeDashoffset: total },
          { strokeDashoffset: 0, duration: 0.75, ease: 'power2.inOut' },
          0.68,
        );
      }
      intro
        .fromTo(
          words[2],
          { xPercent: 6, scale: 1.04, clipPath: 'inset(100% 0 0 0)' },
          { xPercent: 0, scale: 1, clipPath: 'inset(0% 0 0 0)', duration: 0.72 },
          0.65,
        )
        .from(
          words[3],
          { x: -8, clipPath: 'inset(0 100% 0 0)', duration: 0.6, ease: 'power3.out' },
          0.82,
        )
        .fromTo(
          purpose,
          { backgroundPosition: '100% 50%' },
          { backgroundPosition: '0% 50%', duration: 0.6, ease: 'power3.inOut' },
          0.88,
        )
        .from(
          '.hero-bottom > p',
          { y: 12, opacity: 0, duration: 0.5, ease: 'power3.out' },
          0.98,
        )
        .from(
          '.hero-bottom > a',
          { y: 8, opacity: 0, duration: 0.45, stagger: 0.06, ease: 'power3.out' },
          1.08,
        );
    } else {
      intro
        .fromTo(
          words[0],
          {
            xPercent: -profile.heroX,
            scale: profile.heroScale,
            clipPath: 'inset(0 100% 0 0)',
          },
          { xPercent: 0, scale: 1, clipPath: 'inset(0 0% 0 0)', duration: 1 },
          0.25,
        )
        .from(
          words[1],
          {
            x: profile.heroNudge,
            clipPath: 'inset(0 0 0 100%)',
            duration: 0.82,
          },
          0.42,
        )
        .fromTo(
          words[2],
          {
            xPercent: profile.heroX,
            scale: Math.max(1.04, profile.heroScale - 0.04),
            clipPath: 'inset(100% 0 0 0)',
          },
          { xPercent: 0, scale: 1, clipPath: 'inset(0% 0 0 0)', duration: 0.95 },
          0.72,
        )
        .from(
          words[3],
          { x: -profile.heroNudge, clipPath: 'inset(0 100% 0 0)', duration: 0.8 },
          0.88,
        )
        .from(
          '.hero-intro > *, .hero-bottom > *',
          { y: 8, opacity: 0, duration: 0.6, stagger: profile.textStagger },
          1.02,
        );
      const colorWords = [strategy, purpose].filter(Boolean);
      if (colorWords.length)
        intro.fromTo(
          colorWords,
          { backgroundPosition: '100% 50%' },
          {
            backgroundPosition: '0% 50%',
            duration: 1.15,
            stagger: 0.12,
            ease: 'power2.inOut',
          },
          0.52,
        );
      if (path) {
        const total = path.getTotalLength();
        intro.fromTo(
          path,
          { strokeDasharray: total, strokeDashoffset: total },
          { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' },
          0.45,
        );
      }
    }
  }
  if (title && !mobile)
    gsap.to(title, {
      scale: profile.titleScale,
      y: profile.scrubY,
      transformOrigin: '50% 0%',
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.75 },
    });
  const loop = hero.querySelector('.lime-line');
  if (loop)
    gsap.to(loop, {
      yPercent: mobile ? 2 : 18,
      rotation: mobile ? 0 : 2,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: narrow ? 'bottom 18%' : 'bottom top',
        scrub: narrow ? 0.5 : 0.8,
      },
    });
  if (intro) {
    hero.dataset.ambientReady = 'false';
    intro.eventCallback('onComplete', () => {
      hero.dataset.ambientReady = 'true';
    });
  } else {
    hero.dataset.ambientReady = 'true';
  }
  return () => {
    intro?.kill();
    delete hero.dataset.ambientReady;
  };
}
export function initHeroPointer() {
  const hero = document.querySelector<HTMLElement>('.hero');
  if (!hero) return () => {};
  const profile = getProfile();
  if (!profile.pointer) return () => {};
  const layers = [['.lime-line', profile.pointer]] as const;
  const tweens = layers.flatMap(([selector, amplitude]) => {
    const el = hero.querySelector(selector);
    return el
      ? [
          {
            amplitude,
            x: gsap.quickTo(el, 'x', { duration: 0.8, ease: MOTION.easeOut }),
            y: gsap.quickTo(el, 'y', { duration: 0.8, ease: MOTION.easeOut }),
          },
        ]
      : [];
  });
  let inView = true;
  const move = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || !inView || hero.dataset.ambientReady !== 'true') return;
    const r = hero.getBoundingClientRect();
    tweens.forEach((t) => {
      t.x(((event.clientX - r.left) / r.width - 0.5) * t.amplitude * 2);
      t.y(((event.clientY - r.top) / r.height - 0.5) * t.amplitude * 2);
    });
  };
  const leave = () =>
    tweens.forEach((t) => {
      t.x(0);
      t.y(0);
    });
  hero.addEventListener('pointermove', move);
  hero.addEventListener('pointerleave', leave);
  const gate = ScrollTrigger.create({
    trigger: hero,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: ({ isActive }) => {
      inView = isActive;
      if (!isActive) leave();
    },
  });
  return () => {
    hero.removeEventListener('pointermove', move);
    hero.removeEventListener('pointerleave', leave);
    gate.kill();
    tweens.forEach((t) => {
      t.x.tween.kill();
      t.y.tween.kill();
    });
  };
}
