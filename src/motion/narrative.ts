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
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Stop decorative CSS motion outside the viewport and in background tabs.
  const ambientSections = Array.from(root.querySelectorAll<HTMLElement>(
    '.narrative-hero-stack, .narrative-contact',
  ));
  const visibleSections = new Set<Element>();
  const syncAmbient = () => {
    ambientSections.forEach((section) => section.classList.toggle(
      'is-ambient-visible', visibleSections.has(section) && !document.hidden && !reduceMotion,
    ));
  };
  const ambientObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleSections.add(entry.target);
      else visibleSections.delete(entry.target);
    });
    syncAmbient();
  });
  ambientSections.forEach((section) => ambientObserver.observe(section));
  document.addEventListener('visibilitychange', syncAmbient);
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
    played: boolean;
    tween?: gsap.core.Tween | gsap.core.Timeline;
  };
  const titles: TitleState[] = [];
  root
    .querySelectorAll<HTMLElement>(
      '.narrative-chapter:not(.narrative-hero) h2, .narrative-chapter:not(.narrative-hero) h3',
    )
    .forEach((element) => {
      if (element.closest('.narrative-expertise__item')) return;
      element.classList.add('narrative-title-highlight');
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
      if (!played) {
        gsap.set(split.lines, { yPercent: 105, autoAlpha: 0 });
      }
      state = { element, split, played };
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
        });
      },
    });
    const played = enteredTitles.has(heroTitleElement);
    if (!played) {
      gsap.set(split.words, {
        yPercent: 140,
        autoAlpha: 0,
        rotateX: 55,
      });
    }
    state = { element: heroTitleElement, split, played };
    heroTitle = state;
  }

  const playTitle = (state: TitleState | undefined, immediate = false) => {
    if (!state || state.played) return;
    state.played = true;
    enteredTitles.add(state.element);
    if (immediate || reduceMotion) {
      gsap.set(state.split.lines, { clearProps: 'all' });
      if (state.split.words?.length) gsap.set(state.split.words, { clearProps: 'all' });
      return;
    }
    state.tween = gsap.timeline({ overwrite: true }).to(state.split.lines, {
      yPercent: 0,
      autoAlpha: 1,
      duration: 1.05,
      stagger: 0.11,
      ease: 'power4.out',
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
    if (immediate || reduceMotion || !words?.length) {
      gsap.set(words?.length ? words : heroTitle.split.lines, { clearProps: 'all' });
      return;
    }
    const reveal = {
      yPercent: 0,
      autoAlpha: 1,
      rotateX: 0,
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
  const contactCta = root.querySelector<HTMLElement>('.narrative-contact__submit');
  let contactCtaAxis = Number.POSITIVE_INFINITY;
  let contactCtaPlayed = Boolean(contactCta && enteredTitles.has(contactCta));
  if (contactCta && !contactCtaPlayed) gsap.set(contactCta, { y: 24 });
  const introProgress = { value: 0 };
  let segments: LineSegment[] = [];
  let measured = false;
  const measureLine = () => {
    segments = paths
      .map((element) => {
        const segment = measurePath(element);
        element.style.strokeDasharray = `${segment.length}px`;
        return segment;
      })
      .sort((a, b) => a.start - b.start);
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
    if (contactCta && !contactCtaPlayed && tip >= contactCtaAxis) {
      contactCtaPlayed = true;
      enteredTitles.add(contactCta);
      if (contactCta.getBoundingClientRect().bottom < 0) gsap.set(contactCta, { clearProps: 'y' });
      else gsap.to(contactCta, { y: 0, duration: 0.7, ease: 'power3.out' });
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

  // Headings follow their own viewport entry, not the decorative line's
  // document-wide progress, which can finish before a hydrated pin releases.
  titles.forEach((title) => {
    ScrollTrigger.create({
      trigger: title.element,
      start: 'top 75%',
      once: true,
      onEnter: () => playTitle(title, title.element.getBoundingClientRect().bottom < 0),
    });
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

  const expertiseMotion = gsap.context(() => {
    root.querySelectorAll<HTMLElement>('.narrative-expertise__item').forEach((row, index) => {
      if (reduceMotion || enteredTitles.has(row)) return;
      const visual = row.querySelector<HTMLElement>('.narrative-expertise__visual');
      const heading = row.querySelector<HTMLElement>('h3');
      const items = row.querySelectorAll('li');
      if (!visual || !heading) return;
      const direction = index % 2 === 0 ? -1 : 1;
      gsap
        .timeline({
          scrollTrigger: { trigger: row, start: 'top 78%', once: true },
          onStart: () => enteredTitles.add(row),
          defaults: { ease: 'power3.out' },
        })
        .from(visual, {
          x: mobile ? 0 : direction * 44,
          y: mobile ? 24 : 0,
          autoAlpha: 0,
          duration: 0.9,
        })
        .from(
          heading,
          { x: mobile ? 0 : direction * -30, y: 24, autoAlpha: 0, duration: 0.95 },
          0.12,
        )
        .from(items, { y: 16, autoAlpha: 0, duration: 0.55, stagger: 0.065 }, 0.35);
    });
  }, root);

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

  return () => {
    ambientObserver.disconnect();
    document.removeEventListener('visibilitychange', syncAmbient);
    ambientSections.forEach((section) => section.classList.remove('is-ambient-visible'));
    expertiseMotion.revert();
    intro?.kill();
    paths.forEach((path) => {
      path.style.removeProperty('stroke-dasharray');
      path.style.removeProperty('stroke-dashoffset');
    });
    contactCta?.style.removeProperty('transform');
    titles.forEach((title) => {
      title.tween?.kill();
      title.split.revert();
      title.element.classList.remove('narrative-title-highlight');
    });
    heroTitle?.tween?.kill();
    heroTitle?.split.revert();
  };
}
