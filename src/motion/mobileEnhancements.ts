import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import type { Cleanup } from './tokens';

function initScopeMotion(): Cleanup {
  const section = document.querySelector<HTMLElement>('.scope');
  const heading = section?.querySelector<HTMLElement>('#scope-title');
  const subtitle = section?.querySelector<HTMLElement>('.section-heading > p');
  const dot = section?.querySelector<HTMLElement>('[data-scope-dot]');
  if (!section || !heading || !subtitle || !dot) return () => {};

  const split = SplitText.create(heading, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'scope-motion-line',
  });
  const timeline = gsap
    .timeline({
      scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
    })
    .from(split.lines, {
      yPercent: 105,
      xPercent: (index) => (index ? 4 : -4),
      duration: 0.68,
      stagger: 0.1,
      ease: 'power3.out',
    })
    .from(
      dot,
      { scale: 0, rotation: -20, transformOrigin: '50% 70%', duration: 0.42, ease: 'expo.out' },
      0.32,
    )
    .from(subtitle, { y: 14, opacity: 0, duration: 0.5, ease: 'power3.out' }, 0.34);

  return () => {
    timeline.kill();
    split.revert();
  };
}

function initPartnerMotion(): Cleanup {
  const section = document.querySelector<HTMLElement>('.partner');
  if (!section) return () => {};
  const animations: gsap.core.Animation[] = [];
  const splits: SplitText[] = [];
  const heading = section.querySelector<HTMLElement>('#partner-title');
  const copy = section.querySelector<HTMLElement>('.partner-copy');

  if (heading) {
    const split = SplitText.create(heading, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'partner-motion-line',
    });
    splits.push(split);
    animations.push(
      gsap.from(split.lines, {
        yPercent: 105,
        xPercent: (index) => [-4, 4, -2][index] || 0,
        duration: 0.68,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
      }),
    );
  }

  if (copy)
    animations.push(
      gsap.from(copy.children, {
        y: 14,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: copy, start: 'top 90%', once: true },
      }),
    );

  section.querySelectorAll<HTMLElement>('.word-shift > span').forEach((row) => {
    const source = row.querySelector<HTMLElement>('del');
    const arrow = row.querySelector<HTMLElement>('b');
    const result = row.querySelector<HTMLElement>('[data-shift-result]');
    if (!source || !arrow || !result) return;
    const rowTimeline = gsap
      .timeline({
        scrollTrigger: { trigger: row, start: 'top 88%', once: true },
      })
      .from(source, { x: -8, opacity: 0, duration: 0.42, ease: 'power3.out' })
      .fromTo(
        source,
        { '--strike-progress': 0 },
        { '--strike-progress': 1, duration: 0.3, ease: 'power3.inOut' },
        0.08,
      )
      .from(
        arrow,
        { x: -8, y: 8, opacity: 0, rotation: -12, duration: 0.35, ease: 'power3.out' },
        0.1,
      )
      .from(result, { x: 12, opacity: 0, duration: 0.45, ease: 'power3.out' }, 0.14);
    animations.push(rowTimeline);
  });

  section.querySelectorAll<HTMLElement>('.value-columns > article').forEach((article) => {
    const eyebrow = article.querySelector<HTMLElement>('.eyebrow');
    const title = article.querySelector<HTMLElement>('h3');
    const body = article.querySelector<HTMLElement>('p');
    if (!eyebrow || !title || !body) return;
    animations.push(
      gsap
        .timeline({
          scrollTrigger: { trigger: article, start: 'top 88%', once: true },
        })
        .from(eyebrow, { y: 10, opacity: 0, duration: 0.4, ease: 'power3.out' })
        .from(title, { x: 10, opacity: 0, duration: 0.58, ease: 'power3.out' }, 0.08)
        .from(body, { y: 12, opacity: 0, duration: 0.48, ease: 'power3.out' }, 0.2),
    );
  });

  return () => {
    animations.reverse().forEach((animation) => animation.kill());
    splits.reverse().forEach((split) => split.revert());
  };
}

function initNextStepsMotion(): Cleanup {
  const animations: gsap.core.Animation[] = [];
  document.querySelectorAll<HTMLElement>('.next-steps li').forEach((step) => {
    const number = step.querySelector<HTMLElement>('.step-number');
    const title = step.querySelector<HTMLElement>('h3');
    const body = step.querySelector<HTMLElement>('p');
    if (!number || !title || !body) return;
    animations.push(
      gsap
        .timeline({
          scrollTrigger: { trigger: step, start: 'top 90%', once: true },
        })
        .fromTo(
          step,
          { '--next-step-progress': 0 },
          { '--next-step-progress': 1, duration: 0.48, ease: 'power2.inOut' },
        )
        .from(number, { y: 12, opacity: 0, duration: 0.35, ease: 'power3.out' }, 0.04)
        .from(title, { y: 18, opacity: 0, duration: 0.52, ease: 'power3.out' }, 0.1)
        .from(body, { y: 12, opacity: 0, duration: 0.45, ease: 'power3.out' }, 0.18),
    );
  });
  return () => animations.reverse().forEach((animation) => animation.kill());
}

function initWorkCTAMotion(): Cleanup {
  const cta = document.querySelector<HTMLElement>('.work-story-cta');
  const line = cta?.querySelector<HTMLElement>('i');
  const arrow = cta?.querySelector<HTMLElement>('b');
  if (!cta || !line || !arrow) return () => {};
  const timeline = gsap
    .timeline({
      scrollTrigger: { trigger: cta, start: 'top 90%', once: true },
    })
    .from(line, { scaleX: 0.12, duration: 0.58, ease: 'power3.inOut' })
    .from(arrow, { x: -10, y: 10, opacity: 0, duration: 0.42, ease: 'power3.out' }, 0.24);
  return () => timeline.kill();
}

function initTeamMotion(): Cleanup {
  const animations: gsap.core.Animation[] = [];
  document.querySelectorAll<HTMLElement>('.team-profile').forEach((profile) => {
    const image = profile.querySelector<HTMLElement>('.team-photo img');
    const name = profile.querySelector<HTMLElement>('.profile-heading h3');
    const arrow = profile.querySelector<HTMLElement>('.profile-heading a');
    const paragraphs = profile.querySelectorAll<HTMLElement>(':scope > p');
    if (image)
      animations.push(
        gsap.fromTo(
          image,
          { yPercent: 1.5 },
          {
            yPercent: -1.5,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: {
              trigger: profile.querySelector('.team-photo') || profile,
              start: 'top 60%',
              end: 'bottom 28%',
              scrub: 0.7,
            },
          },
        ),
      );
    if (name && arrow)
      animations.push(
        gsap
          .timeline({
            scrollTrigger: { trigger: name, start: 'top 90%', once: true },
          })
          .from(name, {
            y: 18,
            clipPath: 'inset(0 0 100% 0)',
            duration: 0.58,
            ease: 'power3.out',
          })
          .from(
            arrow,
            { x: -10, y: 10, opacity: 0, duration: 0.4, ease: 'power3.out' },
            0.16,
          )
          .from(paragraphs, { y: 12, opacity: 0, duration: 0.48, stagger: 0.08, ease: 'power3.out' }, 0.22),
      );
  });
  return () => animations.reverse().forEach((animation) => animation.kill());
}

export function initMobileEnhancements(): Cleanup {
  const cleanups = [
    initScopeMotion(),
    initPartnerMotion(),
    initNextStepsMotion(),
    initWorkCTAMotion(),
    initTeamMotion(),
  ];
  return () => cleanups.reverse().forEach((cleanup) => cleanup());
}
