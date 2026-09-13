import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { initSmoothScroll } from './smoothScroll';
import { initTextReveals } from './revealText';
import { initRevealMedia } from './revealMedia';
import { initLimeLine } from './limeLine';
import { initCounters } from './counters';
import { initResults } from './results';
import { initMagnetic } from './magnetic';
import { initCursor } from './cursor';
import { initMethod } from './method';
import { initHero, initHeroPointer } from './hero';
import { initProblem } from './problem';
import { initManifesto } from './manifesto';
import { initMobileExperience } from './mobileExperience';
import { initMobileEnhancements } from './mobileEnhancements';
import { initEditorial } from './editorial';
import { initFinalManifesto } from './finalManifesto';
import { initCTA } from './cta';
import { initServices } from './services';
import { initTeamPointer } from './team';
import { initVisualSections } from './visualSections';
import { initTransitions } from './transitions';
import { initHeader } from './header';
import type { Cleanup } from './tokens';
import { MQ, watchLayoutRefresh } from './viewport';
gsap.registerPlugin(ScrollTrigger, SplitText);
let activeCleanup: Cleanup | undefined;
export function initMotion(): Cleanup {
  activeCleanup?.();
  const media = gsap.matchMedia();
  let disposed = false;
  media.add(
    {
      desktop: '(min-width: 1024px)',
      tablet: MQ.tablet,
      mobile: MQ.mobile,
      reduce: MQ.reduce,
    },
    (context) => {
      if (context.conditions?.reduce) return;
      const compactNav = !Boolean(context.conditions?.desktop);
      const mobile = Boolean(context.conditions?.mobile);
      const finePointer = window.matchMedia(MQ.fine).matches;
      const cleanups: Cleanup[] = [];
      const scroll = initSmoothScroll(finePointer && Boolean(context.conditions?.desktop));
      document.documentElement.classList.add('motion-ready');
      const scope = gsap.context(() => {
        cleanups.push(
          scroll.destroy,
          initHeader(scroll, compactNav),
          initHero(compactNav),
          initTextReveals(mobile),
          initProblem(mobile),
          initManifesto(mobile),
          initCounters(mobile),
          initEditorial(mobile),
          initFinalManifesto(mobile),
          initCTA(mobile),
          initServices(),
          initRevealMedia(mobile),
          initVisualSections(mobile),
        );
        if (mobile) cleanups.push(initMobileExperience(), initMobileEnhancements());
        initResults(mobile);
        initLimeLine(mobile);
        initTransitions(mobile);
      });
      return () => {
        cleanups.reverse().forEach((fn) => fn());
        scope.revert();
        document.documentElement.classList.remove('motion-ready');
      };
    },
  );
  media.add(`${MQ.fine} and (prefers-reduced-motion: no-preference)`, () => {
    const cleanups: Cleanup[] = [];
    const scope = gsap.context(() => {
      cleanups.push(initMagnetic(), initCursor(), initHeroPointer(), initTeamPointer());
    });
    return () => {
      cleanups.reverse().forEach((fn) => fn());
      scope.revert();
    };
  });
  media.add(
    `${MQ.pin} and ${MQ.fine} and (prefers-reduced-motion: no-preference)`,
    () => {
      const cleanups: Cleanup[] = [];
      const scope = gsap.context(() => {
        cleanups.push(initMethod());
      });
      return () => {
        cleanups.reverse().forEach((fn) => fn());
        scope.revert();
      };
    },
  );
  const refreshLayout = () => {
    if (disposed) return;
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  };
  const stopWatch = watchLayoutRefresh(refreshLayout);
  document.fonts.ready.then(() => {
    if (!disposed) refreshLayout();
  });
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    stopWatch();
    media.revert();
    if (activeCleanup === cleanup) activeCleanup = undefined;
  };
  activeCleanup = cleanup;
  return cleanup;
}
