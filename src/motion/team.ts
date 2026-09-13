import { gsap } from 'gsap';
import { MOTION, entered } from './tokens';
export function initTeamPointer() {
  const cleanup: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>('.team-photo').forEach((photo) => {
    const image = photo.querySelector('img');
    const number = photo.querySelector('.photo-index');
    const profile = photo.closest('.team-profile');
    const context = gsap.context(() => {}, photo);
    const enter = () => {
      if (!entered.has(photo)) return;
      context.add(() => {
        if (image)
          gsap.to(image, {
            scale: 1.025,
            duration: MOTION.medium,
            ease: MOTION.easeOut,
            overwrite: 'auto',
          });
        if (number) gsap.to(number, { y: -5, duration: MOTION.fast, overwrite: 'auto' });
        profile?.classList.add('is-hovered');
      });
    };
    const leave = () =>
      context.add(() => {
        if (image) gsap.to(image, { scale: 1, duration: MOTION.medium, overwrite: 'auto' });
        if (number) gsap.to(number, { y: 0, duration: MOTION.fast, overwrite: 'auto' });
        profile?.classList.remove('is-hovered');
      });
    photo.addEventListener('pointerenter', enter);
    photo.addEventListener('pointerleave', leave);
    cleanup.push(() => {
      photo.removeEventListener('pointerenter', enter);
      photo.removeEventListener('pointerleave', leave);
      profile?.classList.remove('is-hovered');
      context.revert();
    });
    // Caption and container stay still; only the image shifts, within the existing crop.
    if (image && window.matchMedia('(min-width: 900px)').matches)
      gsap.fromTo(
        image,
        { yPercent: -2 },
        {
          yPercent: 2,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: {
            trigger: photo,
            start: 'top 65%',
            end: 'bottom top',
            scrub: 0.85,
          },
        },
      );
  });
  return () => cleanup.reverse().forEach((fn) => fn());
}
