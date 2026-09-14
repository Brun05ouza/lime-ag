import { gsap } from 'gsap';
import { revealText } from './revealText';
import type { Cleanup } from './tokens';
import { canPin, getProfile } from './viewport';

export function initFinalManifesto(mobile: boolean): Cleanup {
  const stage = document.querySelector<HTMLElement>('.final-stage');
  const statements = Array.from(document.querySelectorAll<HTMLElement>('.final-statement'));
  const profile = getProfile();
  if (mobile) {
    const animations: gsap.core.Animation[] = [];
    const section = document.querySelector<HTMLElement>('.final-manifesto');
    const sticky = stage?.querySelector<HTMLElement>('.final-stage-sticky');
    if (section && stage && sticky && statements.length === 2) {
      section.classList.add('is-mobile-story');
      const setup = statements[0];
      const impact = statements[1];
      const setupLines = gsap.utils.toArray<HTMLElement>('.final-line', setup);
      const leadLines = gsap.utils.toArray<HTMLElement>('.final-lead .final-line', impact);
      const impactBlocks = gsap.utils.toArray<HTMLElement>('[data-final-impact-block]', impact);

      gsap.set(setup, { transformOrigin: 'left top' });
      gsap.set(setupLines, { yPercent: 105, autoAlpha: 0 });
      gsap.set(impact, { autoAlpha: 0 });
      gsap.set(leadLines, { yPercent: 100, autoAlpha: 0 });
      gsap.set(impactBlocks, {
        yPercent: 100,
        autoAlpha: 0,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.9,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .to(setupLines, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.34,
          stagger: 0.04,
          ease: 'power3.out',
        })
        .to({}, { duration: 0.22 })
        .to(
          setup,
          {
            yPercent: -8,
            autoAlpha: 0,
            scale: 0.98,
            duration: 0.3,
            ease: 'power2.inOut',
          },
          0.85,
        )
        .set(impact, { autoAlpha: 1 }, 1.2)
        .to(
          leadLines,
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.38,
            stagger: 0.035,
            ease: 'power3.out',
          },
          1.2,
        )
        .to(
          impactBlocks,
          {
            yPercent: 0,
            autoAlpha: 1,
            duration: 0.4,
            stagger: 0.045,
            ease: 'power3.out',
          },
          1.4,
        )
        .to({}, { duration: 0.36 });

      animations.push(timeline);
    }

    const purpose = document.querySelector<HTMLElement>('.final-purpose');
    const purposeIntro = purpose?.querySelector<HTMLElement>(':scope > p:first-child');
    const purposeImpact = purpose?.querySelector<HTMLElement>(':scope > p:last-child');
    const purposeWord = purpose?.querySelector<HTMLElement>('[data-final-purpose]');
    if (purposeIntro) {
      gsap.set(purposeIntro, { y: 20, autoAlpha: 0 });
      animations.push(
        gsap.to(purposeIntro, {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: purposeIntro, start: 'top 88%', once: true },
        }),
      );
    }
    if (purposeImpact && purposeWord) {
      gsap.set(purposeImpact, { y: 24, autoAlpha: 0 });
      gsap.set(purposeWord, { clipPath: 'inset(0 100% 0 0)' });
      animations.push(
        gsap
          .timeline({
            scrollTrigger: { trigger: purposeImpact, start: 'top 86%', once: true },
          })
          .to(purposeImpact, {
            y: 0,
            autoAlpha: 1,
            duration: 0.75,
            ease: 'power3.out',
          })
          .to(
            purposeWord,
            {
              clipPath: 'inset(0 0% 0 0)',
              duration: 0.6,
              ease: 'power3.inOut',
              clearProps: 'clipPath',
            },
            0.12,
          ),
      );
    }

    document.querySelectorAll<HTMLElement>('.final-pairs > p').forEach((pair) => {
      const lead = pair.querySelector<HTMLElement>('[data-final-pair-lead]');
      const conclusion = pair.querySelector<HTMLElement>('strong');
      if (!lead || !conclusion) return;
      gsap.set(lead, { y: 16, autoAlpha: 0 });
      gsap.set(conclusion, { y: 24, scale: 0.94, autoAlpha: 0 });
      animations.push(
        gsap
          .timeline({
            scrollTrigger: { trigger: pair, start: 'top 88%', once: true },
          })
          .to(lead, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' })
          .to(
            conclusion,
            { y: 0, scale: 1, autoAlpha: 1, duration: 0.72, ease: 'expo.out' },
            0.14,
          ),
      );
    });

    return () => {
      animations.reverse().forEach((animation) => animation.kill());
      section?.classList.remove('is-mobile-story');
    };
  }
  if (stage && statements.length === 2) {
    const pin = canPin();
    if (pin) {
      const height = Math.max(...statements.map((el) => el.getBoundingClientRect().height)) + 100;
      gsap.set(stage, {
        display: 'grid',
        minHeight: height,
        alignItems: 'center',
        overflow: 'hidden',
      });
      gsap.set(statements, { gridArea: '1 / 1', margin: 0 });
    }
    gsap.set(statements[0], {
      x: -70,
      clipPath: 'inset(0 100% 0 0)',
    });
    gsap.set(statements[1], {
      xPercent: 15,
      autoAlpha: 0,
      clipPath: 'inset(0 100% 0 0)',
    });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: pin ? 'top 130px' : 'top 80%',
        end: pin ? () => `+=${window.innerHeight * 1.15}` : 'bottom 35%',
        pin,
        scrub: 0.7,
        invalidateOnRefresh: true,
      },
    });
    tl.to(statements[0], {
      clipPath: 'inset(0 0% 0 0)',
      x: 0,
      duration: 0.45,
    })
      .to(
        statements[0],
        {
          xPercent: -18,
          clipPath: 'inset(0 0 0 100%)',
          duration: 0.55,
          ease: 'power3.inOut',
        },
        0.6,
      )
      .set(statements[1], { autoAlpha: 1 }, 0.6)
      .to(
        statements[1],
        {
          xPercent: 0,
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.55,
          ease: 'power3.inOut',
        },
        0.6,
      );
    const mind = stage.querySelector('[data-final-mind]');
    const heart = stage.querySelector('[data-final-heart]');
    gsap.set([mind, heart], { display: 'inline-block' });
    gsap.set(mind, { x: -40, scale: profile.heroScale });
    gsap.set(heart, { x: 40, scale: profile.heroScale });
    tl.to(mind, { x: 0, scale: 1, duration: 0.4 }, 0.95)
      .to(heart, { x: 0, scale: 1, duration: 0.4 }, 1.05)
      .to({}, { duration: 0.65 });
  }
  const purpose = document.querySelector('.final-purpose');
  if (purpose) {
    const paragraphs = purpose.querySelectorAll('p');
    gsap.set(paragraphs[0], { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(paragraphs[1], { scale: 0.9, clipPath: 'inset(100% 0 0 0)' });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: purpose, start: 'top 92%', end: 'bottom 38%', scrub: 0.6 },
    });
    tl.to(paragraphs[0], { clipPath: 'inset(0 0% 0 0)', duration: 0.45 })
      .to(paragraphs[0], { opacity: 0.3, scale: 0.95, duration: 0.4 }, 0.38)
      .to(paragraphs[1], { scale: 1, clipPath: 'inset(0% 0 0 0)', duration: 0.62 }, 0.38)
      .to({}, { duration: 0.5 });
  }
  const cleanups: Cleanup[] = [];
  document
    .querySelectorAll<HTMLElement>('.final-pairs p')
    .forEach((el) => cleanups.push(revealText(el, mobile, { duration: 0.8, stagger: 0.045 })));
  return () => cleanups.forEach((fn) => fn());
}
