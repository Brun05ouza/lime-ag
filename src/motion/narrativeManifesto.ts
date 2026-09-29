import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { Cleanup } from './tokens';

gsap.registerPlugin(ScrollTrigger, SplitText);

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const minutes = String(Math.floor(total / 60)).padStart(2, '0');
  const remainder = String(total % 60).padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export function initNarrativeManifesto(): Cleanup {
  const section = document.querySelector<HTMLElement>('[data-manifesto-section]');
  const statement = document.querySelector<HTMLElement>('[data-manifesto-statement]');
  if (!section || !statement) return () => {};

  const intro = section.querySelector<HTMLElement>('[data-manifesto-intro]');
  const kicker = section.querySelector<HTMLElement>('[data-manifesto-kicker]');
  const title = section.querySelector<HTMLElement>('[data-manifesto-title]');
  const copy = section.querySelector<HTMLElement>('[data-manifesto-copy]');
  const mediaAnchor = section.querySelector<HTMLElement>('.narrative-manifesto__media-anchor');
  const media = section.querySelector<HTMLElement>('[data-manifesto-media]');
  const mediaUi = section.querySelector<HTMLElement>('[data-manifesto-media-ui]');
  const statementTitle = statement.querySelector<HTMLElement>('[data-highlight-statement]');
  if (
    !intro ||
    !kicker ||
    !title ||
    !copy ||
    !mediaAnchor ||
    !media ||
    !mediaUi ||
    !statementTitle
  ) {
    return () => {};
  }

  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const hasVideo = section.dataset.videoAvailable === 'true';
  const video = section.querySelector<HTMLVideoElement>('[data-manifesto-video]');
  const playButton = section.querySelector<HTMLButtonElement>('[data-manifesto-play]');
  const soundButton = section.querySelector<HTMLButtonElement>('[data-manifesto-sound]');
  const time = section.querySelector<HTMLElement>('[data-manifesto-time]');
  const listeners: Array<() => void> = [];
  let playbackActive = false;
  let manuallyPaused = false;
  let shouldPlayForScroll = false;

  const on = (
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions,
  ) => {
    target.addEventListener(event, listener, options);
    listeners.push(() => target.removeEventListener(event, listener, options));
  };

  const syncPlayLabel = () => {
    if (!video || !playButton) return;
    playButton.textContent = video.paused ? 'Reproduzir' : 'Pausar';
  };

  const syncSoundLabel = () => {
    if (!video || !soundButton) return;
    soundButton.setAttribute('aria-pressed', String(!video.muted));
    soundButton.textContent = video.muted ? 'Ouvir manifesto' : 'Som ligado';
  };

  const syncTime = () => {
    if (!video || !time) return;
    const current = formatTime(video.currentTime);
    const duration = Number.isFinite(video.duration) ? ` / ${formatTime(video.duration)}` : '';
    time.textContent = `${current}${duration}`;
  };

  const pauseVideo = () => {
    if (!video || video.paused) return;
    video.pause();
    playbackActive = false;
    syncPlayLabel();
  };

  const playVideo = () => {
    if (!video || playbackActive || manuallyPaused || video.ended) return;
    playbackActive = true;
    void video.play().catch(() => {
      playbackActive = false;
      syncPlayLabel();
    });
  };

  if (video) {
    video.muted = true;
    video.controls = false;
    media.classList.add('is-enhanced');
    syncPlayLabel();
    syncSoundLabel();
    syncTime();

    if (playButton) {
      on(playButton, 'click', () => {
        if (video.paused || video.ended) {
          if (video.ended) video.currentTime = 0;
          manuallyPaused = false;
          playVideo();
        } else {
          manuallyPaused = true;
          pauseVideo();
        }
      });
    }

    if (soundButton) {
      on(soundButton, 'click', () => {
        video.muted = !video.muted;
        syncSoundLabel();
      });
    }

    on(video, 'play', () => {
      playbackActive = true;
      syncPlayLabel();
    });
    on(video, 'pause', () => {
      playbackActive = false;
      syncPlayLabel();
    });
    on(video, 'ended', () => {
      playbackActive = false;
      manuallyPaused = true;
      syncPlayLabel();
    });
    on(video, 'error', () => {
      media.classList.add('is-fallback');
      pauseVideo();
      if (time) time.textContent = 'Identidade em movimento';
      if (playButton) playButton.hidden = true;
      if (soundButton) soundButton.hidden = true;
    });
    on(video, 'loadedmetadata', syncTime);
    on(video, 'durationchange', syncTime);
    on(video, 'timeupdate', syncTime);
    on(document, 'visibilitychange', () => {
      if (document.hidden) pauseVideo();
      else if (shouldPlayForScroll) playVideo();
    });
  }

  const titleSplit = SplitText.create(title, {
    type: 'lines',
    mask: 'lines',
    linesClass: 'narrative-manifesto__title-line',
  });
  const titleLines = titleSplit.lines;
  const initialScale = mobile ? (hasVideo ? 0.92 : 0.88) : 0.52;
  const initialX = mobile ? 0 : 20;
  const initialY = mobile ? 11 : 9;
  const initialRadius = mobile ? 18 : 24;

  gsap.set(titleLines, { yPercent: 110, autoAlpha: 0 });
  gsap.set([kicker, copy], { y: 28, autoAlpha: 0 });
  gsap.set(media, {
    xPercent: initialX,
    yPercent: initialY,
    scale: initialScale,
    autoAlpha: 0.35,
    borderRadius: initialRadius,
    transformOrigin: mobile ? '50% 55%' : '78% 50%',
  });
  gsap.set(mediaUi, { autoAlpha: 0 });
  gsap.set(statement, { y: 54, autoAlpha: 0 });
  gsap.set(statementTitle, { '--highlight': '0%' });

  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 0.75,
      invalidateOnRefresh: true,
      onUpdate(self) {
        shouldPlayForScroll = self.progress >= 0.22 && self.progress <= 0.9;
        if (shouldPlayForScroll && !document.hidden) playVideo();
        else pauseVideo();
      },
      onLeave: pauseVideo,
      onLeaveBack: pauseVideo,
    },
  });

  timeline
    .to(kicker, { y: 0, autoAlpha: 1, duration: 8, ease: 'power3.out' }, 2)
    .to(
      titleLines,
      { yPercent: 0, autoAlpha: 1, duration: 12, stagger: 2.2, ease: 'power4.out' },
      7,
    )
    .to(copy, { y: 0, autoAlpha: 1, duration: 10, ease: 'power3.out' }, 18)
    .to(media, { autoAlpha: 1, duration: 10, ease: 'power3.out' }, 22)
    .to(mediaUi, { autoAlpha: 1, duration: 8, ease: 'power3.out' }, 27)
    .to(
      media,
      {
        xPercent: 0,
        yPercent: 0,
        scale: 1,
        borderRadius: 10,
        duration: 36,
        ease: 'none',
      },
      32,
    )
    .to(intro, { y: -48, autoAlpha: 0, duration: 20, ease: 'none' }, 40)
    .set(mediaAnchor, { zIndex: 5 }, 42)
    .to(mediaUi, { autoAlpha: 0, duration: 8, ease: 'none' }, 76)
    .to(media, { yPercent: -12, scale: 0.94, autoAlpha: 0.42, duration: 18, ease: 'none' }, 80)
    .to(statement, { y: 0, autoAlpha: 1, duration: 14, ease: 'power3.out' }, 83)
    .to(statementTitle, { '--highlight': '100%', duration: 12, ease: 'none' }, 88);

  return () => {
    pauseVideo();
    listeners.forEach((remove) => remove());
    timeline.scrollTrigger?.kill();
    timeline.kill();
    titleSplit.revert();
    if (video) video.controls = true;
    media.classList.remove('is-enhanced', 'is-fallback');
    if (playButton) playButton.hidden = false;
    if (soundButton) soundButton.hidden = false;
    gsap.set([intro, kicker, copy, mediaAnchor, media, mediaUi, statement], { clearProps: 'all' });
    statementTitle.style.removeProperty('--highlight');
  };
}
