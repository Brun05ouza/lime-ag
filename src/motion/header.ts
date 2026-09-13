import { gsap } from 'gsap';
import type { ScrollRuntime } from './smoothScroll';
import type { Cleanup } from './tokens';
export type HeaderState = 'hero' | 'expanded' | 'collapsed';
interface CloseMenuDetail {
  complete: () => void;
}
const token = (name: string, fallback: number) =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback;
export function addHeaderIntro(timeline: gsap.core.Timeline, compactNav: boolean) {
  const logo = document.querySelector('[data-header-logo]');
  const nav = document.querySelector('[data-header-nav]');
  const links = nav ? Array.from(nav.querySelectorAll('[data-nav-link]')) : [];
  const cta = document.querySelector('[data-header-cta]');
  const toggle = document.querySelector('[data-menu-toggle]');
  if (logo)
    timeline.fromTo(
      logo,
      { y: -10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.42, ease: 'power3.out' },
      0,
    );
  const navigationTarget = compactNav ? toggle : nav;
  if (navigationTarget)
    timeline.fromTo(
      navigationTarget,
      { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
      { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.4, ease: 'power3.out' },
      0.08,
    );
  if (!compactNav && links.length)
    timeline.fromTo(
      links,
      { x: -8 },
      { x: 0, duration: 0.32, stagger: 0.025, ease: 'power3.out' },
      0.08,
    );
  if (cta && !compactNav)
    timeline.fromTo(
      cta,
      { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
      { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.38, ease: 'power3.out' },
      0.18,
    );
}
export function initHeader(scroll: ScrollRuntime, compactNav: boolean): Cleanup {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return () => {};
  const shell = header.querySelector<HTMLElement>('[data-header-shell]');
  const logo = header.querySelector<HTMLElement>('[data-header-logo]');
  const nav = header.querySelector<HTMLElement>('[data-header-nav]');
  const cta = header.querySelector<HTMLElement>('[data-header-cta]');
  const toggle = header.querySelector<HTMLElement>('[data-menu-toggle]');
  const menu = header.querySelector<HTMLDialogElement>('#mobile-menu');
  const menuLinks = menu ? Array.from(menu.querySelectorAll<HTMLElement>('nav a')) : [];
  const menuLine = menu?.querySelector<SVGPathElement>('[data-menu-line]');
  if (!shell || !logo || !nav || !cta || !toggle) return () => {};
  const compactHeader = compactNav && window.matchMedia('(max-width: 1023px)').matches;
  const context = gsap.context(() => {}, header);
  const heroEnter = 56;
  const heroExit = 120;
  const directionThreshold = 12;
  const transitionCooldown = 620;
  const initialScroll = scroll.lenis.animatedScroll || window.scrollY;
  let state: HeaderState = initialScroll < heroEnter ? 'hero' : 'expanded';
  let directionAnchor = initialScroll;
  let lastTransition = 0;
  let menuOpen = false;
  const values = (next: HeaderState) => {
    const heroHeight = token('--header-hero-h', 68);
    const floatHeight = token('--header-float-h', 60);
    const collapsedHeight = token('--header-collapsed-h', 52);
    const inset = token('--floating-inset', compactHeader ? 12 : 20);
    const availableWidth = window.innerWidth - inset * 2;
    const expandedWidth = Math.min(availableWidth, compactHeader ? 240 : 1320);
    const collapsedWidth = Math.min(availableWidth, compactHeader ? 216 : 248);
    if (next === 'hero')
      return {
        width: '100%',
        maxWidth: '1560px',
        height: heroHeight,
        paddingInline: 0,
        borderRadius: 0,
        backgroundColor: 'rgba(51,19,53,0)',
        borderColor: 'rgba(255,255,255,0)',
        boxShadow: '0 10px 35px rgba(22,5,24,0)',
        backdropFilter: 'blur(0px) saturate(100%)',
        logoScale: 1,
      };
    if (next === 'expanded')
      return {
        width: expandedWidth,
        maxWidth: expandedWidth,
        height: floatHeight,
        paddingInline: compactHeader ? 17 : 24,
        borderRadius: 18,
        backgroundColor: 'rgba(51,19,53,.78)',
        borderColor: 'rgba(255,255,255,.08)',
        boxShadow: '0 10px 35px rgba(22,5,24,.14)',
        backdropFilter: 'blur(16px) saturate(130%)',
        logoScale: compactHeader ? 1 : 0.92,
      };
    return {
      width: collapsedWidth,
      maxWidth: collapsedWidth,
      height: collapsedHeight,
      paddingInline: compactHeader ? 15 : 18,
      borderRadius: 17,
      backgroundColor: 'rgba(51,19,53,.82)',
      borderColor: 'rgba(255,255,255,.09)',
      boxShadow: '0 10px 35px rgba(22,5,24,.16)',
      backdropFilter: 'blur(16px) saturate(130%)',
      logoScale: 0.76,
    };
  };
  const applyState = (next: HeaderState, immediate = false) => {
    if (!immediate && next === state) return;
    const previous = state;
    state = next;
    header.dataset.headerState = next;
    const target = values(next);
    const duration = immediate ? 0 : next === 'collapsed' ? 0.76 : 0.5;
    const ease =
      next === 'hero' ? 'power4.out' : next === 'collapsed' ? 'expo.inOut' : 'power4.out';
    const shellStart = next === 'collapsed' ? (compactHeader ? 0.06 : 0.22) : 0;
    context.add(() => {
      gsap.killTweensOf([header, shell, logo, nav, cta, toggle]);
      const timeline = gsap.timeline({
        defaults: { duration, ease, overwrite: 'auto' },
      });
      timeline
        .to(
          header,
          {
            y:
              next === 'collapsed' && compactHeader
                ? -(Number(target.height) - 10)
                : 0,
          },
          shellStart,
        )
        .to(
          shell,
          {
            width: target.width,
            maxWidth: target.maxWidth,
            height: target.height,
            paddingInline: target.paddingInline,
            borderRadius: target.borderRadius,
            backgroundColor: target.backgroundColor,
            borderColor: target.borderColor,
            boxShadow: target.boxShadow,
            backdropFilter: target.backdropFilter,
          },
          shellStart,
        )
        .to(logo, { scale: target.logoScale }, shellStart);
      if (!compactHeader) {
        const reveal = next !== 'collapsed';
        if (reveal) gsap.set([nav, cta], { visibility: 'visible' });
        timeline
          .to(
            nav,
            {
              autoAlpha: reveal ? 1 : 0,
              x: reveal ? 0 : -8,
              clipPath: reveal ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
              duration: reveal ? 0.34 : 0.3,
              ease: reveal ? 'power3.out' : 'power2.inOut',
              onComplete: () => {
                if (!reveal) gsap.set(nav, { visibility: 'hidden' });
              },
            },
            reveal ? 0.2 : 0,
          )
          .to(
            cta,
            {
              autoAlpha: reveal ? 1 : 0,
              clipPath: reveal ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
              duration: reveal ? 0.32 : 0.26,
              ease: reveal ? 'power3.out' : 'power2.inOut',
              onComplete: () => {
                if (!reveal) gsap.set(cta, { visibility: 'hidden' });
              },
            },
            reveal ? 0.25 : 0,
          )
          .to(
            toggle,
            {
              autoAlpha: reveal ? 0 : 1,
              scale: reveal ? 0.9 : 1,
              x: reveal ? 8 : 0,
              pointerEvents: reveal ? 'none' : 'auto',
              duration: reveal ? 0.28 : 0.42,
              ease: reveal ? 'power2.in' : 'power3.out',
            },
            reveal ? 0 : 0.44,
          );
      } else {
        timeline.to(toggle, { autoAlpha: 1, pointerEvents: 'auto' }, 0);
      }
      if (immediate) timeline.progress(1);
    });
    if (previous !== next) lastTransition = performance.now();
  };
  applyState(state, true);
  const update = (event: { animatedScroll: number }) => {
    const current = event.animatedScroll;
    if (menuOpen) {
      directionAnchor = current;
      return;
    }
    if (current < heroEnter) {
      directionAnchor = current;
      applyState('hero');
      return;
    }
    if (state === 'hero' && current < heroExit) return;
    if (state === 'hero') {
      directionAnchor = current;
      applyState('expanded');
      return;
    }
    const delta = current - directionAnchor;
    if (Math.abs(delta) < directionThreshold) return;
    directionAnchor = current;
    if (performance.now() - lastTransition < transitionCooldown) return;
    applyState(delta > 0 ? 'collapsed' : 'expanded');
  };
  scroll.lenis.on('scroll', update);
  const openMenu = () => {
    if (!menu) return;
    menuOpen = true;
    scroll.lenis.stop();
    context.add(() => {
      gsap.killTweensOf([menu, ...menuLinks, menuLine].filter(Boolean));
      const timeline = gsap
        .timeline()
        .set(menu, { autoAlpha: 1, opacity: 1 })
        .fromTo(
          menu,
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0% 0% 0)', duration: 0.48, ease: 'power4.out' },
        )
        .fromTo(
          menuLinks,
          { yPercent: 110, autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' },
          {
            yPercent: 0,
            autoAlpha: 1,
            clipPath: 'inset(0 0 0% 0)',
            duration: 0.5,
            stagger: 0.045,
            ease: 'power3.out',
            clearProps: 'clipPath',
          },
          0.14,
        );
      if (menuLine) {
        const length = menuLine.getTotalLength();
        timeline.fromTo(
          menuLine,
          { strokeDasharray: length, strokeDashoffset: length, autoAlpha: 0.5 },
          { strokeDashoffset: 0, autoAlpha: 1, duration: 0.58, ease: 'power2.inOut' },
          0.2,
        );
      }
    });
  };
  const closeMenu = (event: Event) => {
    if (!menu) return;
    const custom = event as CustomEvent<CloseMenuDetail>;
    if (!custom.detail?.complete) return;
    event.preventDefault();
    const finish = () => {
      menuOpen = false;
      scroll.lenis.start();
      gsap.set(menuLinks, { clearProps: 'transform,opacity,visibility,clipPath' });
      gsap.set(menu, { clearProps: 'opacity,visibility' });
      custom.detail.complete();
    };
    context.add(() => {
      gsap.killTweensOf([menu, ...menuLinks, menuLine].filter(Boolean));
      gsap
        .timeline({ onComplete: finish })
        .to(menuLinks.slice().reverse(), {
          yPercent: -35,
          autoAlpha: 0,
          clipPath: 'inset(100% 0 0 0)',
          duration: 0.26,
          stagger: 0.022,
          ease: 'power2.in',
        })
        .to(
          menu,
          {
            clipPath: 'inset(0 0 100% 0)',
            autoAlpha: 0,
            duration: 0.48,
            ease: 'power4.inOut',
          },
          0.1,
        );
    });
  };
  const expandHeader = () => {
    directionAnchor = scroll.lenis.animatedScroll || window.scrollY;
    applyState('expanded');
  };
  menu?.addEventListener('lime:menu-open', openMenu);
  menu?.addEventListener('lime:menu-close', closeMenu);
  header.addEventListener('lime:header-expand', expandHeader);
  return () => {
    scroll.lenis.off('scroll', update);
    menu?.removeEventListener('lime:menu-open', openMenu);
    menu?.removeEventListener('lime:menu-close', closeMenu);
    header.removeEventListener('lime:header-expand', expandHeader);
    context.revert();
  };
}
