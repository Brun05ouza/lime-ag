import { gsap } from 'gsap';
import { getProfile, visibleLimePath } from './viewport';
export function initProblem(mobile: boolean) {
  const section = document.querySelector<HTMLElement>('.problem');
  if (!section) return () => {};
  const question = section.querySelector('h2');
  const answer = section.querySelector('.problem-answer');
  const connection = section.querySelector('.connection');
  const shift = getProfile().heroNudge;
  if (mobile) {
    const label = section.querySelector('.section-label');
    const note = section.querySelector('.problem-note');
    const connectionLabel = section.querySelector('.connection-label');
    const path = visibleLimePath(section);
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 90%', once: true },
      defaults: { ease: 'power3.out' },
    });
    gsap.set(label, { y: 10, autoAlpha: 0 });
    gsap.set(question, { y: 28, autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' });
    gsap.set(answer, { y: 24, autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' });
    gsap.set(note, { y: 16, autoAlpha: 0 });
    gsap.set(connectionLabel, { autoAlpha: 0 });
    gsap.set(connection, { y: 24, autoAlpha: 0, clipPath: 'inset(0 0 100% 0)' });
    timeline
      .to(label, { y: 0, autoAlpha: 1, duration: 0.55 })
      .to(
        question,
        { y: 0, autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.85 },
        0.06,
      )
      .to(
        answer,
        { y: 0, autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.8 },
        0.18,
      );
    if (path) {
      const length = path.getTotalLength();
      timeline.fromTo(
        path,
        { strokeDasharray: length, strokeDashoffset: length },
        { strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut' },
        0.34,
      );
    }
    timeline
      .to(note, { y: 0, autoAlpha: 1, duration: 0.65 }, 0.42)
      .to(connectionLabel, { autoAlpha: 1, duration: 0.5 }, 0.46)
      .to(
        connection,
        { y: 0, autoAlpha: 1, clipPath: 'inset(0 0 0% 0)', duration: 0.95 },
        0.48,
      );
    return () => timeline.kill();
  }
  const scene = gsap.timeline({
    scrollTrigger: { trigger: section, start: 'top 94%', end: 'bottom 52%', scrub: 0.55 },
  });
  scene
    .fromTo(
      question,
      { x: mobile ? shift : shift * 2, clipPath: 'inset(0 100% 0 0)' },
      { x: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.42 },
    )
    .to(question, { scale: 0.92, x: mobile ? -8 : -65, opacity: 0.45, duration: 0.36 }, 0.36)
    .fromTo(
      answer,
      { x: mobile ? shift * 1.2 : shift * 2.4, clipPath: 'inset(0 0 0 100%)' },
      { x: 0, clipPath: 'inset(0 0 0 0%)', duration: 0.46 },
      0.22,
    )
    .to(answer, { x: mobile ? 12 : 65, opacity: 0.5, duration: 0.34 }, 0.62)
    .to({}, { duration: 0.65 });
  const connectionReveal = gsap.fromTo(
    connection,
    {
      scale: 0.82,
      x: -65,
      transformOrigin: '0% 50%',
      clipPath: 'inset(0 100% 0 0)',
    },
    {
      scale: 1,
      x: 0,
      clipPath: 'inset(0 0% 0 0)',
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: connection, start: 'top 88%', once: true },
    },
  );
  gsap.from(section.querySelector('.problem-note'), {
    clipPath: 'inset(0 100% 0 0)',
    duration: 0.75,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section.querySelector('.problem-note'),
      start: 'top 90%',
      once: true,
    },
  });
  return () => {
    scene.kill();
    connectionReveal.kill();
  };
}
