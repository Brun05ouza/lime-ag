import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MOTION, type Cleanup } from './tokens';
import { createImageReveal } from './imageReveal';

const entryTimeScale = (trigger: ScrollTrigger, mobile: boolean) =>
  mobile && Math.abs(trigger.getVelocity()) > 1200 ? 1.55 : 1;

function initHandsStory(mobile: boolean): Cleanup {
  const section = document.querySelector<HTMLElement>('[data-visual-hands]');
  if (!section) return () => {};

  const media = section.querySelector<HTMLElement>('[data-hands-media]');

  const words = gsap.utils.toArray<HTMLElement>('[data-hands-word]', section);
  const thread = section.querySelector<SVGPathElement>('[data-hands-thread]');
  const animations: gsap.core.Animation[] = [];
  const cleanups: Cleanup[] = [];

  if (thread) {
    const length = thread.getTotalLength();
    gsap.set(thread, { strokeDasharray: length, strokeDashoffset: length });
  }
  words.forEach((word) => {
    gsap.set(word, {
      y: 28,
      autoAlpha: 0,
    });
  });
  const entrance = gsap.timeline({ paused: true });
  words.forEach((word, index) => {
    entrance.to(
      word,
      {
        y: 0,
        autoAlpha: 1,
        duration: mobile ? 0.85 : 1.15,
        ease: 'power2.out',
      },
      index * 0.18,
    );
  });
  if (thread)
    entrance.to(
      thread,
      { strokeDashoffset: 0, duration: 1.15, ease: MOTION.easeStrong },
      mobile ? 0.38 : 0.5,
    );
  entrance.set(words, {
    xPercent: 0,
    yPercent: 0,
    autoAlpha: 1,
    clearProps: 'clipPath',
  });
  animations.push(entrance);
  const entranceTrigger = ScrollTrigger.create({
    trigger: section,
    start: 'top 92%',
    once: true,
    onEnter: (trigger) => entrance.timeScale(entryTimeScale(trigger, mobile)).play(),
    onEnterBack: () => entrance.timeScale(1).play(),
  });
  const initialBounds = section.getBoundingClientRect();
  if (initialBounds.bottom <= 0) entrance.progress(1);
  else if (initialBounds.top < window.innerHeight * 0.92) entrance.play();
  cleanups.push(() => entranceTrigger.kill());

  // Keep the full-bleed photograph on one stable layer. Only typography animates.
  if (media) gsap.set(media, { autoAlpha: 1, clearProps: 'transform,clipPath' });
  return () => {
    cleanups.reverse().forEach((cleanup) => cleanup());
    animations.reverse().forEach((animation) => animation.kill());
  };
}
function initHumanStory(mobile: boolean): Cleanup {
  const section = document.querySelector<HTMLElement>('[data-human-story]');
  if (!section) return () => {};

  const media = section.querySelector<HTMLElement>('[data-human-media]');
  const image = media?.querySelector<HTMLElement>('img');
  const lines = gsap.utils.toArray<HTMLElement>('[data-human-line]', section);
  const animations: gsap.core.Animation[] = [];
  const cleanups: Cleanup[] = [];

  if (media) {
    lines.forEach((line, index) => {
      gsap.set(line, {
        yPercent: index === lines.length - 1 ? 105 : 75,
        xPercent: index % 2 ? 3 : -3,
        autoAlpha: 0,
        clipPath: 'inset(0 0 100% 0)',
      });
    });
    const entrance = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 96%',
        once: true,
        onEnter: (trigger) => entrance.timeScale(entryTimeScale(trigger, mobile)),
      },
    });
    lines.forEach((line, index) => {
      entrance.to(
        line,
        {
          yPercent: 0,
          xPercent: 0,
          autoAlpha: 1,
          clipPath: 'inset(0 0 0% 0)',
          duration: mobile ? 0.85 : 0.95,
          ease: MOTION.easeStrong,
        },
        index * 0.1,
      );
    });
    entrance.set(lines, { clearProps: 'clipPath' });
    entrance.to({}, { duration: 0.18 });
    animations.push(entrance);
    cleanups.push(
      createImageReveal({
        wrapper: media,
        image,
        trigger: section,
        start: 'top 94%',
        clipPath: 'inset(100% 0 0 0)',
        duration: mobile ? 1.05 : 1.2,
        initialScale: 1.06,
        finalScale: 1.02,
      }),
    );
  }

  if (image && !mobile) {
    animations.push(
      gsap.fromTo(
        image,
        { yPercent: -3 },
        {
          yPercent: 3,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: section,
            start: 'top 65%',
            end: 'bottom top',
            scrub: 0.8,
          },
        },
      ),
    );
  }
  const ambientGate = ScrollTrigger.create({
    trigger: section,
    start: 'top 65%',
    end: 'bottom top',
    onToggle: ({ isActive }) => section.classList.toggle('is-ambient-active', isActive),
  });
  cleanups.push(() => {
    ambientGate.kill();
    section.classList.remove('is-ambient-active');
  });

  return () => {
    cleanups.reverse().forEach((cleanup) => cleanup());
    animations.reverse().forEach((animation) => animation.kill());
  };
}

function initWorkStory(mobile: boolean): Cleanup {
  const section = document.querySelector<HTMLElement>('[data-work-story]');
  if (!section) return () => {};

  const collage = section.querySelector<HTMLElement>('[data-story-collage]');
  const social = section.querySelector<HTMLElement>('[data-story-layer="social"]');
  const megaphone = section.querySelector<HTMLElement>('[data-story-layer="megaphone"]');
  const heart = section.querySelector<HTMLElement>('[data-story-layer="heart"]');
  const lines = gsap.utils.toArray<HTMLElement>('[data-story-line]', section);
  const supporting = gsap.utils.toArray<HTMLElement>('.work-empty-copy > :is(small, p, a)', section);
  const animations: gsap.core.Animation[] = [];
  const cleanups: Cleanup[] = [];

  if (collage) {
    const directions = [4, -4, 3];
    lines.forEach((line, index) => {
      gsap.set(line, {
        xPercent: mobile ? Math.sign(directions[index]) * 6 : directions[index],
        yPercent: index === 2 ? 14 : 6,
        autoAlpha: 0,
      });
    });
    gsap.set(supporting, { y: 18, autoAlpha: 0 });
    const entrance = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 96%',
        once: true,
        onEnter: (trigger) => entrance.timeScale(entryTimeScale(trigger, mobile)),
      },
    });
    lines.forEach((line, index) => {
      entrance.to(
        line,
        {
          xPercent: 0,
          yPercent: 0,
          autoAlpha: 1,
          duration: mobile ? 0.72 : 0.85,
          ease: MOTION.easeOut,
        },
        0.06 + index * (mobile ? 0.1 : 0.12),
      );
    });
    entrance.to(
      supporting,
      {
        y: 0,
        autoAlpha: 1,
        duration: mobile ? 0.65 : 0.75,
        stagger: 0.08,
        ease: MOTION.easeOut,
      },
      mobile ? 0.3 : 0.34,
    );
    entrance.to({}, { duration: 0.18 });
    animations.push(entrance);
    cleanups.push(
      createImageReveal({
        wrapper: collage,
        image: social,
        trigger: section,
        start: 'top 94%',
        clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
        finalClipPath: mobile
          ? 'polygon(0 0, 88% 0, 100% 100%, 0 100%)'
          : 'polygon(0 0, 86% 0, 100% 100%, 0 100%)',
        duration: mobile ? 1 : 1.15,
        initialScale: mobile ? 1.04 : 1.08,
      },
    ),
    );
  }

  if (!mobile) {
    if (social) {
      animations.push(
        gsap.fromTo(
          social,
          { xPercent: -2.5 },
          {
            xPercent: 2.5,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: 'top 60%',
              end: 'bottom top',
              scrub: 0.85,
            },
          },
        ),
      );
    }
    if (megaphone) {
      animations.push(
        gsap.fromTo(
          megaphone,
          { xPercent: -4, yPercent: 2 },
          {
            xPercent: 5,
            yPercent: -3,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: 'top 60%',
              end: 'bottom top',
              scrub: 0.85,
            },
          },
        ),
      );
    }
    if (heart) {
      animations.push(
        gsap.fromTo(
          heart,
          { xPercent: 3, yPercent: -2 },
          {
            xPercent: -4,
            yPercent: 3,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: section,
              start: 'top 60%',
              end: 'bottom top',
              scrub: 0.85,
            },
          },
        ),
      );
    }
  }
  const ambientGate = ScrollTrigger.create({
    trigger: section,
    start: 'top 60%',
    end: 'bottom top',
    onToggle: ({ isActive }) => section.classList.toggle('is-ambient-active', isActive),
  });
  cleanups.push(() => {
    ambientGate.kill();
    section.classList.remove('is-ambient-active');
  });

  return () => {
    cleanups.reverse().forEach((cleanup) => cleanup());
    animations.reverse().forEach((animation) => animation.kill());
  };
}

export function initVisualSections(mobile: boolean): Cleanup {
  const cleanups = [initHandsStory(mobile), initHumanStory(mobile), initWorkStory(mobile)];
  return () => cleanups.reverse().forEach((cleanup) => cleanup());
}

