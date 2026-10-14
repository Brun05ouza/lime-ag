import { useId, useLayoutEffect, useRef, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChartNoAxesCombined, ClipboardList, Rocket, SearchCheck } from 'lucide-react';
import { process as steps } from '../../data/process';
import '../../styles/strategy-journey.scss';

gsap.registerPlugin(ScrollTrigger);

const road =
  'M-130 600 C10 600 30 440 180 440 C330 440 360 350 540 350 C720 350 720 500 900 460 C1080 420 1110 330 1260 330 C1410 330 1430 220 1580 220';
const verticalRoad =
  'M27 -1200 L27 150 C27 300 65 300 65 450 C65 600 27 600 27 750 C27 900 65 900 65 1050 L65 2400';
const anchors = [
  { x: 180, y: 440 },
  { x: 540, y: 350 },
  { x: 900, y: 460 },
  { x: 1260, y: 330 },
];
const names = ['Imersão e Raio-X', 'Plano de Ação', 'Execução', 'Evolução e Escala'];
const top = [12, 1, 15, 0];

function StageIcon({ index }: { index: number }) {
  const Icon = [SearchCheck, ClipboardList, Rocket, ChartNoAxesCombined][index];
  return <Icon aria-hidden="true" focusable="false" />;
}

export default function StrategyJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const playedStages = useRef(new Set<number>());
  const gradient = `strategy-${useId().replace(/:/g, '')}`;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const media = gsap.matchMedia();
    media.add(
      {
        desktop: '(min-width: 1024px) and (min-height: 700px)',
        compact: '(max-width: 1023px), (max-height: 699px)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      ({ conditions }) => {
        if (conditions?.reduce) return;
        const cards = gsap.utils.toArray<HTMLElement>('.strategy-card', section);
        const markers = gsap.utils.toArray<HTMLElement>('.strategy-marker', section);
        const connectors = gsap.utils.toArray<HTMLElement>('.strategy-connector', section);
        if (!conditions?.desktop) {
          cards.forEach((card, index) => {
            if (playedStages.current.has(index)) return;
            const reveal = gsap.timeline({
              onStart: () => {
                playedStages.current.add(index);
              },
              scrollTrigger: {
                id: `strategy-mobile-${index}`,
                trigger: card,
                start: 'top 88%',
                once: true,
              },
            });
            reveal
              .from(markers[index], {
                scale: 0.94,
                autoAlpha: 0,
                duration: 0.3,
                ease: 'power2.out',
              })
              .from(
                connectors[index],
                { scaleX: 0, transformOrigin: 'left center', duration: 0.35 },
                0.15,
              )
              .from(card, { y: 18, autoAlpha: 0, duration: 0.45, ease: 'power3.out' }, 0.25);
          });
          return;
        }

        // Breakpoint changes keep completed content visible instead of replaying it.
        if (playedStages.current.size) return;

        // Opposite translations reveal a stationary, rasterized SVG through a
        // rectangular overflow clip. WAAPI can run these on the compositor,
        // without changing SVG paths or repainting a clip-path every frame.
        const curtain = section.querySelector<HTMLElement>('.strategy-road-reveal')!;
        const artwork = section.querySelector<HTMLElement>('.strategy-road-artwork')!;
        const roadAnimations = [curtain, artwork].map((element, index) => {
          const animation = element.animate(
            [
              { transform: `translate3d(${index === 0 ? '-100%' : '100%'}, 0, 0)` },
              { transform: 'translate3d(0, 0, 0)' },
            ],
            { duration: 1600, easing: 'linear', fill: 'both' },
          );
          animation.pause();
          animation.currentTime = 0;
          return animation;
        });

        // Entry starts a timed sequence; it keeps playing without further scroll.
        const tl = gsap.timeline({
          onStart: () => {
            roadAnimations.forEach((animation) => animation.play());
            cards.forEach((_, index) => playedStages.current.add(index));
          },
          scrollTrigger: {
            id: 'strategy-journey',
            trigger: section,
            start: 'top 75%',
            once: true,
          },
        });
        const moving = [headingRef.current, ...cards, ...markers, ...connectors];
        tl.set(moving, { willChange: 'transform,opacity' }, 0).from(
          headingRef.current,
          { opacity: 0, y: 10, duration: 0.35, ease: 'power2.out' },
          0,
        );
        cards.forEach((card, index) => {
          const arrival = (anchors[index].x / 1440) * 1.6;
          tl.from(
            markers[index],
            { opacity: 0, scale: 0.98, duration: 0.25, ease: 'power2.out' },
            arrival,
          )
            .from(
              connectors[index],
              {
                scaleY: 0,
                transformOrigin: 'bottom center',
                duration: 0.2,
                ease: 'power2.out',
              },
              arrival + 0.05,
            )
            .from(card, { opacity: 0, y: 12, duration: 0.4, ease: 'power2.out' }, arrival + 0.1);
        });
        tl.set(moving, { clearProps: 'willChange' });
        return () => roadAnimations.forEach((animation) => animation.cancel());
      },
      section,
    );
    // Recalculate entry positions after hydration and font loading.
    let disposed = false;
    let refresh = 0;
    document.fonts.ready.then(() => {
      if (!disposed)
        refresh = requestAnimationFrame(() => {
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        });
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(refresh);
      media.revert();
    };
  }, []);

  return (
    <section
      id="processo"
      className="strategy-journey"
      ref={sectionRef}
      aria-labelledby="strategy-title"
    >
      <div className="strategy-panel">
        <div className="strategy-heading" ref={headingRef}>
          <h2 id="strategy-title">
            Assumindo a <strong>Estratégia</strong>
          </h2>
        </div>
        <div className="strategy-scene">
          <div className="strategy-road-reveal" aria-hidden="true">
            <div className="strategy-road-artwork">
              <svg
                className="strategy-road strategy-road--desktop"
                viewBox="0 0 1440 640"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient
                    id={gradient}
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    y1="0"
                    x2="1440"
                    y2="0"
                  >
                    <stop stopColor="#ff6945" />
                    <stop offset="1" stopColor="#ff315c" />
                  </linearGradient>
                </defs>
                <path className="strategy-road-shadow" d={road} />
                <path className="strategy-road-main" d={road} stroke={`url(#${gradient})`} />
              </svg>
            </div>
          </div>
          <svg
            className="strategy-road strategy-road--vertical"
            viewBox="0 0 90 1200"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id={`${gradient}-vertical`}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2="0"
                y2="1200"
              >
                <stop stopColor="#ff6945" />
                <stop offset="1" stopColor="#ff315c" />
              </linearGradient>
            </defs>
            <path className="strategy-road-shadow" d={verticalRoad} />
            <path
              className="strategy-road-main"
              d={verticalRoad}
              stroke={`url(#${gradient}-vertical)`}
            />
          </svg>
          <ol className="strategy-stages">
            {steps.map((step, index) => (
              <li
                key={step.title}
                style={
                  {
                    '--stage-x': `${(anchors[index].x / 1440) * 100}%`,
                    '--marker-y': `${(anchors[index].y / 640) * 100}%`,
                    '--card-y': `${top[index]}%`,
                  } as CSSProperties
                }
              >
                <article className="strategy-card">
                  <span>0{index + 1} / 04</span>
                  <h3>{names[index]}</h3>
                  <p>{step.text}</p>
                </article>
                <span className="strategy-connector" aria-hidden="true" />
                <span className="strategy-marker" aria-hidden="true">
                  <StageIcon index={index} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
