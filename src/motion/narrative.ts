import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { addHeaderIntro } from './header';
import type { Cleanup } from './tokens';

gsap.registerPlugin(ScrollTrigger, SplitText);
const enteredTitles = new WeakSet<HTMLElement>();
const completedIntros = new WeakSet<HTMLElement>();

type LineSample = { y: number; length: number };
type LineSegment = {
  element: SVGPathElement;
  start: number;
  end: number;
  length: number;
  samples?: LineSample[];
};

function measurePath(path: SVGPathElement): LineSegment {
  const pathLength = path.getTotalLength();
  const matrix = path.getScreenCTM();
  if (!matrix) return { element: path, start: 0, end: 0, length: pathLength };

  // The stroke dash and the scroll position both use screen pixels. Sampling
  // also keeps the visible tip at the same document height through wide curves.
  const samples = Math.max(80, Math.ceil(pathLength / 10));
  let previous = path.getPointAtLength(0);
  let renderedLength = 0;
  const positions: LineSample[] = [
    { y: matrix.b * previous.x + matrix.d * previous.y + matrix.f + window.scrollY, length: 0 },
  ];
  for (let index = 1; index <= samples; index += 1) {
    const point = path.getPointAtLength((pathLength * index) / samples);
    const dx = point.x - previous.x;
    const dy = point.y - previous.y;
    renderedLength += Math.hypot(dx * matrix.a + dy * matrix.c, dx * matrix.b + dy * matrix.d);
    const y = matrix.b * point.x + matrix.d * point.y + matrix.f + window.scrollY;
    positions.push({ y: Math.max(y, positions[index - 1].y), length: renderedLength });
    previous = point;
  }
  return {
    element: path,
    start: positions[0].y,
    end: positions[positions.length - 1].y,
    length: renderedLength,
    samples: positions,
  };
}

function drawnLengthAt(samples: LineSample[], tip: number): number {
  let low = 0;
  let high = samples.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (samples[middle].y < tip) low = middle;
    else high = middle;
  }
  const from = samples[low];
  const to = samples[high];
  const progress = gsap.utils.clamp(0, 1, (tip - from.y) / Math.max(0.001, to.y - from.y));
  return from.length + (to.length - from.length) * progress;
}

export function initNarrative(): Cleanup {
  const root = document.querySelector<HTMLElement>('[data-narrative-home]');
  if (!root) return () => {};
  const mobile = window.matchMedia('(max-width: 767px)').matches;
  const paths = Array.from(root.querySelectorAll<HTMLElement>('.narrative-line'))
    .map((line) =>
      line.querySelector<SVGPathElement>(
        mobile ? '.narrative-line__mobile path' : '.narrative-line__desktop path',
      ),
    )
    .filter((path): path is SVGPathElement => Boolean(path));
  type TitleState = {
    element: HTMLElement;
    split: SplitText;
    axis: number;
    played: boolean;
    tween?: gsap.core.Tween | gsap.core.Timeline;
  };
  const titles: TitleState[] = [];
  root
    .querySelectorAll<HTMLElement>('.narrative-chapter:not(.narrative-statement) h2')
    .forEach((element) => {
      let state: TitleState | undefined;
      const split = SplitText.create(element, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'narrative-title-line',
        autoSplit: true,
        onSplit(self) {
          if (state?.played || enteredTitles.has(element)) {
            state?.tween?.kill();
            return gsap.set(self.lines, { clearProps: 'all' });
          }
          return gsap.set(self.lines, { yPercent: 105, autoAlpha: 0 });
        },
      });
      const played = enteredTitles.has(element);
      if (!played) gsap.set(split.lines, { yPercent: 105, autoAlpha: 0 });
      state = { element, split, axis: 0, played };
      titles.push(state);
    });

  const heroTitleElement = root.querySelector<HTMLElement>('.narrative-hero h1');
  let heroTitle: TitleState | undefined;
  if (heroTitleElement) {
    let state: TitleState | undefined;
    const split = SplitText.create(heroTitleElement, {
      type: 'lines,words',
      mask: 'lines',
      linesClass: 'narrative-hero-line',
      wordsClass: 'narrative-hero-word',
      autoSplit: true,
      onSplit(self) {
        if (state?.played || enteredTitles.has(heroTitleElement)) {
          state?.tween?.kill();
          return gsap.set(self.words, { clearProps: 'all' });
        }
        return gsap.set(self.words, {
          yPercent: 140,
          autoAlpha: 0,
          rotateX: 55,
          filter: 'blur(12px)',
        });
      },
    });
    const played = enteredTitles.has(heroTitleElement);
    if (!played) {
      gsap.set(split.words, {
        yPercent: 140,
        autoAlpha: 0,
        rotateX: 55,
        filter: 'blur(12px)',
      });
    }
    state = { element: heroTitleElement, split, axis: 0, played };
    heroTitle = state;
  }

  const playTitle = (state: TitleState | undefined, immediate = false) => {
    if (!state || state.played) return;
    state.played = true;
    enteredTitles.add(state.element);
    if (immediate) {
      gsap.set(state.split.lines, { clearProps: 'all' });
      if (state.split.words?.length) gsap.set(state.split.words, { clearProps: 'all' });
      return;
    }
    state.tween = gsap.to(state.split.lines, {
      yPercent: 0,
      autoAlpha: 1,
      duration: 1.05,
      stagger: 0.11,
      ease: 'power4.out',
      overwrite: true,
    });
  };

  const playHeroTitle = (immediate = false) => {
    if (!heroTitle || heroTitle.played) return;
    heroTitle.played = true;
    enteredTitles.add(heroTitle.element);
    const words = heroTitle.split.words;
    const firstWords = Array.from(
      heroTitle.element.querySelectorAll<HTMLElement>(
        '.narrative-hero__setup .narrative-hero-word',
      ),
    );
    const secondWords = Array.from(
      heroTitle.element.querySelectorAll<HTMLElement>('em .narrative-hero-word'),
    );
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (immediate || reduceMotion || !words?.length) {
      gsap.set(words?.length ? words : heroTitle.split.lines, { clearProps: 'all' });
      return;
    }
    const reveal = {
      yPercent: 0,
      autoAlpha: 1,
      rotateX: 0,
      filter: 'blur(0px)',
      ease: 'expo.out',
    };
    const timeline = gsap.timeline({ overwrite: true });
    timeline.to(firstWords.length ? firstWords : words, {
      ...reveal,
      duration: 0.72,
      stagger: 0.045,
    });
    if (secondWords.length) {
      timeline.to(
        secondWords,
        {
          ...reveal,
          duration: 0.76,
          stagger: 0.045,
        },
        '+=0.08',
      );
    }
    heroTitle.tween = timeline;
  };
  const statement = root.querySelector<HTMLElement>('[data-highlight-statement]');
  const contactCta = root.querySelector<HTMLElement>('.narrative-contact__submit');
  let contactCtaAxis = Number.POSITIVE_INFINITY;
  let contactCtaPlayed = Boolean(contactCta && enteredTitles.has(contactCta));
  if (contactCta && !contactCtaPlayed) gsap.set(contactCta, { y: 24 });
  let statementPlayed = Boolean(statement && enteredTitles.has(statement));
  if (statementPlayed && statement) gsap.set(statement, { '--highlight': '100%' });
  const introProgress = { value: 0 };
  let segments: LineSegment[] = [];
  let measured = false;
  const processSteps = Array.from(root.querySelectorAll<HTMLElement>('[data-process-step]'));
  const measureLine = () => {
    segments = paths
      .map((element) => {
        const segment = measurePath(element);
        element.style.strokeDasharray = `${segment.length}px`;
        return segment;
      })
      .sort((a, b) => a.start - b.start);
    titles.forEach((title) => {
      const rect = title.element.getBoundingClientRect();
      title.axis = rect.top + window.scrollY + Math.min(rect.height * 0.28, 90);
    });
    if (contactCta) {
      contactCtaAxis = contactCta.getBoundingClientRect().top + window.scrollY - 45;
    }
    measured = true;
  };
  const drawLine = (scroll: number) => {
    if (!measured) return;
    const firstStart = segments[0]?.start ?? 0;
    const targetTip = scroll + window.innerHeight * 0.65;
    const tip = firstStart + (targetTip - firstStart) * introProgress.value;
    segments.forEach(({ element, start, end, length, samples }) => {
      const progress = gsap.utils.clamp(0, 1, (tip - start) / Math.max(1, end - start));
      const drawn = samples ? drawnLengthAt(samples, tip) : length * progress;
      element.style.strokeDashoffset = `${length - drawn}px`;
    });
    titles.forEach((title) => {
      if (tip >= title.axis) {
        playTitle(title, title.element.getBoundingClientRect().bottom < 0);
      }
    });
    if (statement && !statementPlayed) {
      const rect = statement.getBoundingClientRect();
      if (tip >= rect.top + window.scrollY + Math.min(rect.height * 0.28, 90)) {
        statementPlayed = true;
        enteredTitles.add(statement);
        if (rect.bottom < 0) gsap.set(statement, { '--highlight': '100%' });
        else gsap.to(statement, { '--highlight': '100%', duration: 0.85, ease: 'power3.out' });
      }
    }
    if (contactCta && !contactCtaPlayed && tip >= contactCtaAxis) {
      contactCtaPlayed = true;
      enteredTitles.add(contactCta);
      if (contactCta.getBoundingClientRect().bottom < 0) gsap.set(contactCta, { clearProps: 'y' });
      else gsap.to(contactCta, { y: 0, duration: 0.7, ease: 'power3.out' });
    }
    if (processSteps.length) {
      const first = processSteps[0].getBoundingClientRect();
      const last = processSteps[processSteps.length - 1].getBoundingClientRect();
      const start = first.top + window.scrollY + first.height * 0.15;
      const end = last.top + window.scrollY + last.height * 0.55;
      const progress = gsap.utils.clamp(0, 1, (tip - start) / Math.max(1, end - start));
      processSteps.forEach((step, index) => {
        const threshold = index / Math.max(1, processSteps.length - 1);
        step.classList.toggle('is-active', progress >= threshold - 0.08);
      });
    }
  };
  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    onRefresh: (self) => {
      measureLine();
      drawLine(self.scroll());
    },
    onUpdate: (self) => drawLine(self.scroll()),
  });

  root.querySelectorAll<HTMLElement>('[data-narrative-reveal]').forEach((element) => {
    if (element.closest('.narrative-hero') || element.matches('h1, h2')) return;
    gsap.from(element, {
      y: 22,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: element, start: 'top 88%', once: true },
    });
  });

  const hero = root.querySelector<HTMLElement>('.narrative-hero');
  const heroItems = hero?.querySelectorAll<HTMLElement>('[data-narrative-reveal]');
  const heroPortrait = hero?.querySelector<HTMLElement>('.narrative-hero__portrait');
  const heroLead = hero?.querySelector<HTMLElement>('.narrative-lead');
  const heroCta = hero?.querySelector<HTMLElement>('.narrative-link');
  let intro: gsap.core.Timeline | undefined;

  const playIntro = () => {
    const headerElements = document.querySelectorAll<HTMLElement>(
      '[data-header-logo], [data-header-nav], [data-header-cta], [data-menu-toggle]',
    );
    if (
      completedIntros.has(root) ||
      !heroItems ||
      window.scrollY > (hero?.offsetHeight || 800) * 0.65
    ) {
      if (heroItems) gsap.set(heroItems, { clearProps: 'all' });
      introProgress.value = 1;
      drawLine(window.scrollY);
      playHeroTitle(true);
      gsap.set(headerElements, { clearProps: 'opacity,visibility' });
      completedIntros.add(root);
      return;
    }
    completedIntros.add(root);
    intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
    addHeaderIntro(intro, window.matchMedia('(max-width: 1279px)').matches);
    intro.to(
      introProgress,
      { value: 1, duration: 1.25, ease: 'none', onUpdate: () => drawLine(window.scrollY) },
      0.04,
    );
    if (heroPortrait)
      intro.fromTo(
        heroPortrait,
        { y: 36, autoAlpha: 0, scale: 1.04 },
        { y: 0, autoAlpha: 1, scale: 1, duration: 1.05, ease: 'power3.out' },
        0.12,
      );
    intro.call(() => playHeroTitle(), undefined, 0.2);
    if (heroLead)
      intro.fromTo(
        heroLead,
        { y: 28, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' },
        2.12,
      );
    if (heroCta)
      intro.fromTo(
        heroCta,
        { y: 22, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.55, ease: 'power3.out' },
        2.6,
      );
  };
  playIntro();

  // The existing MetricCounter markup is retained, but the value settles once
  // when it enters view instead of reversing as the visitor scrolls upward.
  root.querySelectorAll<HTMLElement>('[data-counter]').forEach((element) => {
    const value = Number(element.dataset.value);
    const final = element.dataset.final || '';
    const suffix = element.dataset.suffix || '';
    const proxy = { value: 0 };
    gsap.to(proxy, {
      value,
      duration: 1.5,
      ease: 'power2.out',
      scrollTrigger: { trigger: element, start: 'top 94%', once: true },
      onUpdate: () => {
        let numeric = Number.isInteger(value)
          ? String(Math.round(proxy.value))
          : proxy.value.toFixed(1);
        if (final.startsWith('0')) numeric = numeric.padStart(2, '0');
        element.textContent = `${numeric}${suffix}`;
      },
      onComplete: () => {
        element.textContent = final;
      },
    });
  });

  const dialog = document.querySelector<HTMLDialogElement>('[data-manifesto-dialog]');
  const video = dialog?.querySelector<HTMLVideoElement>('[data-manifesto-replay-video]');
  const error = dialog?.querySelector<HTMLElement>('[data-manifesto-replay-error]');
  const trigger = root.querySelector<HTMLButtonElement>('[data-manifesto-replay]');
  const close = dialog?.querySelector<HTMLButtonElement>('[data-manifesto-close]');
  const openDialog = () => {
    if (!dialog || !video) return;
    dialog.showModal();
    if (error) error.hidden = true;
    void video.play().catch(() => {
      if (error) error.hidden = false;
    });
  };
  const closeDialog = () => {
    video?.pause();
    dialog?.close();
    trigger?.focus({ preventScroll: true });
  };
  const onVideoError = () => {
    if (error) error.hidden = false;
  };
  trigger?.addEventListener('click', openDialog);
  close?.addEventListener('click', closeDialog);
  video?.addEventListener('error', onVideoError);
  dialog?.addEventListener('close', () => video?.pause());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) closeDialog();
  });
  return () => {
    intro?.kill();
    paths.forEach((path) => {
      path.style.removeProperty('stroke-dasharray');
      path.style.removeProperty('stroke-dashoffset');
    });
    contactCta?.style.removeProperty('transform');
    processSteps.forEach((step) => step.classList.remove('is-active'));
    titles.forEach((title) => {
      title.tween?.kill();
      title.split.revert();
    });
    heroTitle?.tween?.kill();
    heroTitle?.split.revert();
    trigger?.removeEventListener('click', openDialog);
    close?.removeEventListener('click', closeDialog);
    video?.removeEventListener('error', onVideoError);
  };
}
