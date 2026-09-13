import { gsap } from 'gsap';
export interface ServiceTransition {
  apply: () => void;
  next: HTMLElement | null;
}
export function initServices() {
  const cleanups: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>('[data-services]').forEach((explorer) => {
    const context = gsap.context(() => {}, explorer);
    let pending: gsap.core.Timeline | undefined;
    let ghost: HTMLElement | undefined;
    const transition = (raw: Event) => {
      const event = raw as CustomEvent<ServiceTransition>;
      event.preventDefault();
      pending?.progress(1);
      pending?.kill();
      ghost?.remove();
      ghost = undefined;
      const current = explorer.querySelector<HTMLElement>('.service-panel:not([hidden])');
      const { apply, next } = event.detail;
      if (current === next) { apply(); return; }
      const wide = window.matchMedia('(min-width: 900px)').matches;
      context.add(() => {
        // A temporary inert copy allows overlap without exposing two active panels.
        if (wide && current) {
          ghost = current.cloneNode(true) as HTMLElement;
          ghost.removeAttribute('id');
          ghost.removeAttribute('aria-labelledby');
          ghost.setAttribute('aria-hidden', 'true');
          ghost.inert = true;
          ghost.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
          ghost.classList.add('scope-outgoing');
          current.parentElement?.append(ghost);
        }
        const outgoing = ghost;
        const oldHeight = current?.offsetHeight || 0;
        apply();
        pending = gsap.timeline({ onComplete: () => { outgoing?.remove(); ghost = undefined; } });
        if (outgoing) pending.to(outgoing, { y: -12, autoAlpha: 0, duration: 0.24, ease: 'power2.in' }, 0);
        if (!next) return;
        const intro = next.querySelector(':scope > p');
        const items = next.querySelectorAll('li');
        const cta = next.querySelector('a');
        const chapter = next.querySelector('.scope-chapter');
        if (!wide) {
          const height = next.offsetHeight;
          pending.fromTo(next, { height: current === next ? oldHeight : 0 }, { height, duration: 0.45, ease: 'power3.out', clearProps: 'height' }, 0);
        }
        pending.fromTo(intro, { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power3.out' }, 0.08)
          .fromTo(items, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.045, ease: 'power3.out' }, 0.18)
          .fromTo(cta, { y: 8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' }, 0.38)
          .fromTo(chapter, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.04);
      });
    };
    explorer.addEventListener('lime:service-change', transition);
    cleanups.push(() => {
      explorer.removeEventListener('lime:service-change', transition);
      pending?.kill();
      ghost?.remove();
      context.revert();
    });
  });
  return () => cleanups.forEach(fn => fn());
}
