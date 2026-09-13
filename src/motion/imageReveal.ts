import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION, entered, hasPassed, type Cleanup } from './tokens';

interface ImageRevealOptions {
  wrapper: HTMLElement;
  image?: HTMLElement | null;
  trigger?: Element | null;
  start?: string;
  clipPath?: string;
  finalClipPath?: string;
  duration?: number;
  delay?: number;
  initialScale?: number;
  finalScale?: number;
  compose?: (timeline: gsap.core.Timeline) => void;
  onComplete?: () => void;
}

export function createImageReveal({
  wrapper,
  image,
  trigger = wrapper,
  start = 'top 92%',
  clipPath = 'inset(0 0 100% 0)',
  finalClipPath,
  duration = 1.1,
  delay = 0,
  initialScale = 1.04,
  finalScale = 1,
  compose,
  onComplete,
}: ImageRevealOptions): Cleanup {
  if (entered.has(wrapper) || hasPassed(wrapper)) {
    entered.add(wrapper);
    return () => {};
  }

  const resolvedFinalClip =
    finalClipPath ||
    (getComputedStyle(wrapper).clipPath === 'none' || getComputedStyle(wrapper).clipPath.startsWith('inset(')
      ? 'inset(0% 0% 0% 0%)'
      : getComputedStyle(wrapper).clipPath);

  gsap.set(wrapper, { autoAlpha: 0, clipPath });
  if (image) gsap.set(image, { scale: initialScale, transformOrigin: '50% 50%' });
  wrapper.classList.add('is-reveal-prepared');

  const timeline = gsap.timeline({
    paused: true,
    defaults: { ease: MOTION.easeStrong },
    onComplete: () => {
      entered.add(wrapper);
      wrapper.classList.remove('is-reveal-prepared', 'is-revealing');
      onComplete?.();
    },
  });
  if (delay) timeline.to({}, { duration: delay });
  timeline.to(wrapper, {
    autoAlpha: 1,
    clipPath: resolvedFinalClip,
    duration,
  }, delay);
  if (image) {
    timeline.to(
      image,
      {
        scale: finalScale,
        duration: duration + 0.15,
        ease: MOTION.easeOut,
      },
      delay,
    );
  }
  compose?.(timeline);

  let disposed = false;
  let removeLoadListeners = () => {};
  const media = Array.from(wrapper.querySelectorAll('img'));
  let mediaReady: Promise<void> | undefined;
  const prepareMedia = () => {
    if (mediaReady) return mediaReady;
    const listeners: Array<() => void> = [];
    const waitForImage = (item: HTMLImageElement) =>
      new Promise<void>((resolve) => {
        item.loading = 'eager';
        const decode = () => {
          if (typeof item.decode === 'function') {
            void item
              .decode()
              .catch(() => {})
              .finally(resolve);
          } else {
            resolve();
          }
        };
        if (item.complete) {
          decode();
          return;
        }
        const settled = () => {
          remove();
          decode();
        };
        const remove = () => {
          item.removeEventListener('load', settled);
          item.removeEventListener('error', settled);
        };
        listeners.push(remove);
        item.addEventListener('load', settled, { once: true });
        item.addEventListener('error', settled, { once: true });
      });
    removeLoadListeners = () => listeners.splice(0).forEach((remove) => remove());
    mediaReady = Promise.all(media.map(waitForImage)).then(() => undefined);
    return mediaReady;
  };
  const preloadObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      preloadObserver.disconnect();
      void prepareMedia();
    },
    { rootMargin: '250% 0px' },
  );
  preloadObserver.observe(wrapper);

  const play = () => {
    if (disposed) return;
    /*
     * Never keep the whole media frame transparent while a lazy image decodes.
     * The frame reveal and the network lifecycle are independent: the image can
     * settle inside an already visible frame without leaving a blank section.
     */
    wrapper.classList.add('is-revealing');
    timeline.play();
    void prepareMedia();
  };

  const scrollTrigger = ScrollTrigger.create({
    trigger: trigger || wrapper,
    start,
    once: true,
    onEnter: play,
    onEnterBack: play,
  });

  return () => {
    disposed = true;
    preloadObserver.disconnect();
    removeLoadListeners();
    wrapper.classList.remove('is-reveal-prepared', 'is-revealing');
    scrollTrigger.kill();
    timeline.kill();
  };
}
