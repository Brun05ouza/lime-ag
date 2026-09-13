import { gsap } from 'gsap';
import { revealText } from './revealText';
import { textSwap } from './TextSwap';
import type { Cleanup } from './tokens';
import { getProfile } from './viewport';
export function initManifesto(mobile: boolean): Cleanup {
  const cleanups: Cleanup[] = [];
  const heading = document.querySelector<HTMLElement>('.manifesto h2');
  const profile = getProfile();
  if (mobile) {
    const animations: gsap.core.Animation[] = [];
    const reveal = (target: gsap.TweenTarget, trigger: Element | null, delay = 0) => {
      if (!trigger) return;
      gsap.set(target, { y: 24, autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' });
      animations.push(
        gsap.to(target, {
          y: 0,
          autoAlpha: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.85,
          stagger: 0.05,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger, start: 'top 88%', once: true },
        }),
      );
    };
    if (heading) reveal(heading.querySelectorAll('[data-kinetic-word]'), heading);
    document.querySelectorAll<HTMLElement>('[data-swap-item]').forEach((item, index) => {
      reveal(item, item, index * 0.04);
    });
    const manifestoCopy = document.querySelector<HTMLElement>('.manifesto-columns > div');
    reveal(manifestoCopy?.children || [], manifestoCopy);
    const result = document.querySelector<HTMLElement>('.manifesto-result');
    if (result) {
      const stage = result.querySelector<HTMLElement>('.manifesto-result-stage');
      const words = Array.from(result.querySelectorAll<HTMLElement>('[data-result-word]'));
      const explanation = stage?.querySelector<HTMLElement>(':scope > p:last-of-type');
      const bridge = document.createElement('span');
      bridge.className = 'result-bridge';
      bridge.textContent = 'ESTRATÉGIA.';
      bridge.setAttribute('aria-hidden', 'true');
      stage?.append(bridge);
      result.classList.add('is-mobile-story');
      if (stage && explanation && words.length === 3) {
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: result,
            start: 'top 75%',
            end: 'bottom 85%',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
        gsap.set(words[0], { yPercent: 72, scale: 0.96, autoAlpha: 0 });
        gsap.set(words[1], { xPercent: 6, yPercent: 48, autoAlpha: 0 });
        gsap.set(words[2], { clipPath: 'inset(0 100% 0 0)', opacity: 0.15 });
        gsap.set(explanation, { y: 16, autoAlpha: 0 });
        gsap.set(bridge, { yPercent: 85, scale: 0.94, autoAlpha: 0 });
        timeline
          .to(words[0], {
            yPercent: 0,
            scale: 1,
            autoAlpha: 1,
            duration: 0.38,
            ease: 'power3.out',
          })
          .to(
            words[1],
            {
              xPercent: 0,
              yPercent: 0,
              autoAlpha: 1,
              duration: 0.4,
              ease: 'power3.out',
            },
            0.12,
          )
          .to(
            words[2],
            {
              clipPath: 'inset(0 0% 0 0)',
              opacity: 1,
              duration: 0.4,
              ease: 'power3.inOut',
            },
            0.28,
          )
          .to(
            explanation,
            { y: 0, autoAlpha: 1, duration: 0.34, ease: 'power3.out' },
            0.24,
          )
          .to({}, { duration: 0.42 })
          .to(
            [...words, explanation],
            { opacity: 0.16, scale: 0.97, duration: 0.32, ease: 'power2.inOut' },
            1.02,
          )
          .to(
            bridge,
            { yPercent: 0, scale: 1, autoAlpha: 1, duration: 0.48, ease: 'power3.out' },
            1.08,
          )
          .to({}, { duration: 0.45 });
        animations.push(timeline);
      }
      cleanups.push(() => bridge.remove());
      cleanups.push(() => result.classList.remove('is-mobile-story'));
    }
    document.querySelectorAll<HTMLElement>('.origin h3, .origin p').forEach((element) => {
      reveal(element, element);
    });
    return () => {
      animations.reverse().forEach((animation) => animation.kill());
      cleanups.reverse().forEach((cleanup) => cleanup());
    };
  }
  if (heading) {
    const words = heading.querySelectorAll('[data-kinetic-word]');
    gsap.set(words, { display: 'inline-block' });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: heading, start: 'top 82%', end: 'top 42%', scrub: 0.65 },
    });
    if (words.length === 3)
      tl.fromTo(
        words[0],
        { xPercent: profile.heroX, scale: profile.heroScale },
        { xPercent: 0, scale: 1, duration: 0.6 },
      )
        .from(words[1], { scale: 0.85, clipPath: 'inset(0 100% 0 0)', duration: 0.5 }, 0.28)
        .from(
          words[2],
          {
            xPercent: profile.heroX,
            clipPath: 'inset(0 0 0 100%)',
            duration: 0.55,
          },
          0.4,
        )
        .to({}, { duration: 0.55 });
  }
  document
    .querySelectorAll<HTMLElement>('[data-text-swap]')
    .forEach((el) => cleanups.push(textSwap(el, mobile)));
  const statement = document.querySelector('.manifesto .statement');
  if (statement)
    gsap.from(statement, {
      scale: 0.85,
      clipPath: 'inset(0 100% 0 0)',
      duration: mobile ? 0.85 : 0.95,
      ease: 'power4.out',
      scrollTrigger: { trigger: statement, start: 'top 78%', once: true },
    });
  const result = document.querySelector<HTMLElement>('.manifesto-result');
  if (result) {
    const stage = result.querySelector<HTMLElement>('.manifesto-result-stage');
    const words = result.querySelectorAll('[data-result-word]');
    const explanation = stage?.querySelector<HTMLElement>(':scope > p:last-of-type');
    gsap.set(words, { display: 'inline-block' });
    const bridge = document.createElement('span');
    bridge.className = 'result-bridge';
    bridge.textContent = 'ESTRATÉGIA.';
    bridge.setAttribute('aria-hidden', 'true');
    stage?.append(bridge);
    result.classList.add('is-scroll-story');
    cleanups.push(() => {
      result.classList.remove('is-scroll-story');
      bridge.remove();
    });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: result,
        start: 'top 92%',
        end: 'top 12%',
        scrub: 1.25,
        invalidateOnRefresh: true,
      },
    });
    if (words.length === 3 && explanation)
      tl.from(words[0], { scale: profile.heroScale, xPercent: -profile.heroX * 0.5, duration: 0.48 })
        .from(words[1], { xPercent: profile.heroX + 5, clipPath: 'inset(0 0 0 100%)', duration: 0.44 }, 0.12)
        .from(words[2], { xPercent: -profile.heroX, clipPath: 'inset(0 100% 0 0)', duration: 0.44 }, 0.24)
        .to({}, { duration: 0.5 })
        .to([words[0], words[1]], { xPercent: -30, opacity: 0, duration: 1.3, ease: 'power1.inOut' }, 1.2)
        .to(words[2], { xPercent: 30, opacity: 0, duration: 1.3, ease: 'power1.inOut' }, 1.2)
        .to(explanation, { xPercent: 26, opacity: 0, duration: 1.3, ease: 'power1.inOut' }, 1.2)
        .fromTo(
          bridge,
          { y: 20, scale: 0.98, opacity: 0, clipPath: 'inset(0 100% 0 0)' },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            clipPath: 'inset(0 0% 0 0)',
            duration: 1.5,
            ease: 'power1.inOut',
          },
          1.65,
        )
        .to({}, { duration: 0.45 });
  }
  document
    .querySelectorAll<HTMLElement>(
      '.manifesto-columns > div > p:last-child, .manifesto-result > p:last-of-type, .origin h3, .origin p',
    )
    .forEach((el) => cleanups.push(revealText(el, mobile, { duration: 0.8, stagger: 0.045 })));
  return () => cleanups.reverse().forEach((fn) => fn());
}
