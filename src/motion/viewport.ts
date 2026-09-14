import type { Cleanup } from './tokens';

export const MQ = {
  mobile: '(max-width: 767.98px)',
  tablet: '(min-width: 768px) and (max-width: 1023.98px)',
  smallDesktop: '(min-width: 1024px) and (max-width: 1199.98px)',
  desktop: '(min-width: 1200px)',
  largeDesktop: '(min-width: 1600px)',
  navDesktop: '(min-width: 1024px)',
  pin: '(min-width: 1024px) and (min-height: 760px)',
  method: '(min-width: 1024px) and (min-height: 540px)',
  compactHeight: '(max-height: 800px) and (min-width: 900px)',
  shortHero: '(max-height: 680px)',
  landscapeShort: '(orientation: landscape) and (max-height: 540px)',
  fine: '(hover: hover) and (pointer: fine)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const;

export const MOTION_PROFILE = {
  desktop: {
    heroX: 15,
    heroScale: 1.15,
    heroNudge: 55,
    parallax: 4,
    textStagger: 0.07,
    pointer: 12,
    scrubY: 88,
    titleScale: 1.1,
  },
  tablet: {
    heroX: 8,
    heroScale: 1.1,
    heroNudge: 28,
    parallax: 2,
    textStagger: 0.05,
    pointer: 6,
    scrubY: 42,
    titleScale: 1.06,
  },
  mobile: {
    heroX: 5,
    heroScale: 1.06,
    heroNudge: 16,
    parallax: 1,
    textStagger: 0.035,
    pointer: 0,
    scrubY: 18,
    titleScale: 1.03,
  },
} as const;

export type MotionLane = keyof typeof MOTION_PROFILE;
export type MotionProfile = (typeof MOTION_PROFILE)[MotionLane];

export function matches(query: string) {
  return window.matchMedia(query).matches;
}

export function motionLane(): MotionLane {
  if (matches(MQ.mobile) || matches(MQ.landscapeShort)) return 'mobile';
  if (matches(MQ.tablet) || matches(MQ.smallDesktop)) return 'tablet';
  return 'desktop';
}

export function getProfile(): MotionProfile {
  const lane = motionLane();
  if (lane === 'desktop' && (matches(MQ.compactHeight) || matches(MQ.shortHero))) {
    return MOTION_PROFILE.tablet;
  }
  return MOTION_PROFILE[lane];
}

export function canPin() {
  return matches(MQ.pin) && !matches(MQ.landscapeShort);
}

export function watchLayoutRefresh(refresh: () => void): Cleanup {
  let width = window.innerWidth;
  let height = window.innerHeight;
  let timer = 0;
  const consider = () => {
    const nextWidth = window.innerWidth;
    const nextHeight = window.innerHeight;
    if (Math.abs(nextWidth - width) < 40 && Math.abs(nextHeight - height) < 40) return;
    width = nextWidth;
    height = nextHeight;
    refresh();
  };
  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(consider, 220);
  };
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('orientationchange', schedule);
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener('resize', schedule);
    window.removeEventListener('orientationchange', schedule);
  };
}

export function visibleLimePath(root: ParentNode = document) {
  return Array.from(root.querySelectorAll<SVGPathElement>('[data-lime-path]')).find(
    (path) => getComputedStyle(path).display !== 'none',
  );
}
