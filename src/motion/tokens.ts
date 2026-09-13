export const MOTION = {
  fast: 0.35,
  medium: 0.7,
  slow: 0.8,
  mobile: 0.8,
  stagger: 0.07,
  mobileStagger: 0.045,
  scrub: 0.6,
  easeOut: 'power3.out',
  easeStrong: 'power4.out',
  easeExpo: 'expo.out',
} as const;
export type Cleanup = () => void;
export const hasPassed = (element: Element) => element.getBoundingClientRect().bottom <= 0;
export const entered = new WeakSet<Element>();
