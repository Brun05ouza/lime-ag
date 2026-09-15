import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { track } from '../lib/analytics';
import {
  MANIFESTO_ACTIVE_CLASS,
  MANIFESTO_COMPLETE_EVENT,
  MANIFESTO_REVEAL_EVENT,
  hasSeenManifesto,
  isManifestoActive,
  markManifestoRevealed,
  markManifestoSeen,
  setManifestoState,
  type ManifestoState,
} from '../lib/manifesto';
import { getLenis } from './scrollRuntime';
import type { Cleanup } from './tokens';

gsap.registerPlugin(ScrollTrigger);

const SITE_INERT = 'header, main, footer, .skip-link';

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setSiteInert(inert: boolean) {
  document.querySelectorAll<HTMLElement>(SITE_INERT).forEach((element) => {
    if (inert) element.setAttribute('inert', '');
    else element.removeAttribute('inert');
  });
}

function lockScroll() {
  document.documentElement.classList.add(MANIFESTO_ACTIVE_CLASS);
  getLenis()?.stop();
}

function unlockScroll() {
  document.documentElement.classList.remove(MANIFESTO_ACTIVE_CLASS);
  getLenis()?.start();
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const minutes = String(Math.floor(total / 60)).padStart(2, '0');
  const rest = String(total % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}

export function initEntryManifesto(): Cleanup {
  const root = document.querySelector<HTMLElement>('[data-entry-manifesto]');
  if (!root) return () => {};
  if (!isManifestoActive()) {
    document.documentElement.classList.add(MANIFESTO_ACTIVE_CLASS);
    setManifestoState('intro');
  }

  const video = root.querySelector<HTMLVideoElement>('[data-entry-video]');
  const scrim = root.querySelector<HTMLElement>('[data-entry-scrim]');
  const intro = root.querySelector<HTMLElement>('[data-entry-intro]');
  const line = root.querySelector<HTMLElement>('.entry-manifesto-line');
  const play = root.querySelector<HTMLButtonElement>('[data-entry-play]');
  const skip = root.querySelector<HTMLButtonElement>('[data-entry-skip]');
  const fallback = root.querySelector<HTMLButtonElement>('[data-entry-fallback]');
  const error = root.querySelector<HTMLElement>('[data-entry-error]');
  const hud = root.querySelector<HTMLElement>('[data-entry-hud]');
  const progress = root.querySelector<HTMLElement>('[data-entry-progress]');
  const hudLabel = hud?.querySelector<HTMLElement>('.entry-manifesto-hud-label');
  if (!video || !scrim || !intro || !play || !error || !fallback) return () => {};

  const seen = hasSeenManifesto();
  const reduce = prefersReducedMotion();
  let finished = false;
  let failed = false;
  let raf = 0;
  const listeners: Array<() => void> = [];

  root.hidden = false;
  document.documentElement.classList.add('manifesto-ready');
  lockScroll();
  setSiteInert(true);
  setManifestoState('intro');
  gsap.set(scrim, { autoAlpha: 0.42 });
  gsap.set(video, { scale: 1.06, autoAlpha: 0.18 });
  if (skip) skip.hidden = !seen;
  play.focus({ preventScroll: true });

  const on = (target: EventTarget, type: string, handler: EventListener, options?: AddEventListenerOptions) => {
    target.addEventListener(type, handler, options);
    listeners.push(() => target.removeEventListener(type, handler, options));
  };

  const setState = (state: ManifestoState) => {
    setManifestoState(state);
  };

  const updateHud = () => {
    if (!hud || hud.hidden) return;
    const ratio = video.duration ? video.currentTime / video.duration : 0;
    if (progress) progress.style.width = `${Math.min(1, Math.max(0, ratio)) * 100}%`;
    if (hudLabel) hudLabel.textContent = `Manifesto  ${formatTime(video.currentTime)}`;
    raf = window.requestAnimationFrame(updateHud);
  };

  const showHud = () => {
    if (!hud) return;
    hud.hidden = false;
    window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(updateHud);
  };

  const hideHud = () => {
    if (hud) hud.hidden = true;
    window.cancelAnimationFrame(raf);
  };

  const finishLayer = () => {
    finished = true;
    hideHud();
    video.pause();
    setSiteInert(false);
    setState('completed');
    document.documentElement.classList.remove('manifesto-ready');
    unlockScroll();
    root.hidden = true;
    root.setAttribute('aria-hidden', 'true');
    document.dispatchEvent(new CustomEvent(MANIFESTO_COMPLETE_EVENT));
    ScrollTrigger.refresh();
    document.getElementById('main')?.focus({ preventScroll: true });
  };

  const revealHome = () => {
    markManifestoRevealed();
    document.dispatchEvent(new CustomEvent(MANIFESTO_REVEAL_EVENT));
  };

  const leaveToSite = (markSeen: boolean, duration: number) => {
    if (finished) return;
    gsap.set(
      document.querySelectorAll(
        '[data-header-logo], [data-header-nav], [data-header-cta], [data-menu-toggle]',
      ),
      { opacity: 0, visibility: 'visible' },
    );
    setState('transitioning');
    hideHud();
    const scale = reduce ? 1 : 1.03;
    const blur = reduce ? 0 : 8;
    const timeline = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: finishLayer,
    });
    timeline
      .to(intro, { autoAlpha: 0, y: reduce ? 0 : -16, duration: duration * 0.45 }, 0)
      .to(line, { autoAlpha: 0, duration: duration * 0.4 }, 0)
      .to(video, { scale, filter: `blur(${blur}px)`, duration: duration * 0.7 }, 0)
      .to(scrim, { autoAlpha: 1, duration: duration * 0.55 }, 0.08)
      .add(() => {
        if (markSeen) markManifestoSeen();
        revealHome();
      })
      .to(root, { autoAlpha: 0, duration: duration * 0.42 }, `>=${duration * 0.28}`);
  };

  const startPlayback = async () => {
    if (finished || document.documentElement.dataset.manifesto === 'playing') return;
    play.disabled = true;
    video.preload = 'auto';
    const duration = reduce ? 0.45 : 0.82;
    const timeline = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
    timeline
      .to(play, { scale: reduce ? 1 : 0.96, duration: 0.18, ease: 'power2.out' }, 0)
      .to(intro, { autoAlpha: 0, y: reduce ? 0 : -18, duration }, 0.06)
      .to(line, { autoAlpha: 0, scale: reduce ? 1 : 0.96, duration }, 0.08)
      .to(scrim, { autoAlpha: 0, duration: duration * 0.85 }, 0.12)
      .to(video, { autoAlpha: 1, scale: 1, duration }, 0.1);
    try {
      const playing = video.play();
      const ready = new Promise<void>((resolve, reject) => {
        if (video.readyState >= 2) {
          resolve();
          return;
        }
        if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
          reject(new Error('source'));
          return;
        }
        const fail = () => reject(new Error('source'));
        const ok = () => resolve();
        video.addEventListener('canplay', ok, { once: true });
        video.addEventListener('error', fail, { once: true });
        window.setTimeout(() => {
          video.removeEventListener('canplay', ok);
          video.removeEventListener('error', fail);
          if (video.readyState < 2) fail();
        }, 5000);
      });
      await Promise.all([playing, ready]);
      setState('playing');
      track('manifesto_play');
      showHud();
    } catch {
      timeline.kill();
      showError();
    }
  };

  const showError = () => {
    if (finished || failed) return;
    failed = true;
    hideHud();
    intro.hidden = true;
    error.hidden = false;
    setState('intro');
    track('manifesto_error');
    gsap.set([scrim, video], { autoAlpha: 1, scale: 1, filter: 'none' });
    fallback.focus({ preventScroll: true });
  };

  const skipExperience = () => {
    if (!hasSeenManifesto()) return;
    track('manifesto_skip');
    leaveToSite(false, reduce ? 0.5 : 0.72);
  };

  on(play, 'click', () => {
    void startPlayback();
  });
  on(fallback, 'click', () => leaveToSite(false, reduce ? 0.4 : 0.55));
  if (skip) on(skip, 'click', skipExperience);
  on(video, 'ended', () => {
    track('manifesto_complete');
    leaveToSite(true, reduce ? 0.7 : 1.25);
  });
  on(video, 'error', showError);
  on(video, 'abort', showError);
  on(video, 'stalled', () => {
    window.setTimeout(() => {
      if (video.readyState < 2 && document.documentElement.dataset.manifesto === 'playing') showError();
    }, 8000);
  });
  on(document, 'keydown', ((event: Event) => {
    const key = (event as KeyboardEvent).key;
    if (key === 'Escape') {
      if (hasSeenManifesto()) {
        event.preventDefault();
        skipExperience();
      }
      return;
    }
    if (key !== 'Tab' || root.hidden) return;
    const focusable = Array.from(
      root.querySelectorAll<HTMLElement>('button:not([hidden]), a:not([hidden])'),
    ).filter((element) => !element.closest('[hidden]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if ((event as KeyboardEvent).shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!(event as KeyboardEvent).shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }) as EventListener);

  return () => {
    finished = true;
    hideHud();
    listeners.forEach((remove) => remove());
    gsap.killTweensOf([root, video, scrim, intro, line, play]);
    setSiteInert(false);
    unlockScroll();
  };
}
