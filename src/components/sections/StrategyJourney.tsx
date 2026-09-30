import { useId, useLayoutEffect, useRef, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChartNoAxesCombined, Rocket } from 'lucide-react';
import { process as steps } from '../../data/process';
import '../../styles/strategy-journey.scss';

gsap.registerPlugin(ScrollTrigger);

const road =
  'M-130 600 C10 600 30 440 180 440 C330 440 360 350 540 350 C720 350 720 500 900 460 C1080 420 1110 330 1260 330 C1410 330 1430 220 1580 220';
const verticalRoad =
  'M45 -60 C45 40 27 100 27 150 C27 310 65 330 65 450 C65 590 27 620 27 750 C27 900 65 930 65 1050 C65 1150 45 1220 45 1280';
const anchors = [
  { x: 180, y: 440 },
  { x: 540, y: 350 },
  { x: 900, y: 460 },
  { x: 1260, y: 330 },
];
const names = ['Imersão e Raio-X', 'Plano de Ação', 'Execução', 'Evolução e Escala'];
const top = [12, 1, 15, 0];

function StageIcon({ index }: { index: number }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      {index === 0 && (
        <>
          <circle cx="13" cy="13" r="7" />
          <path d="m18 18 8 8M10 13h6M13 10v6" />
        </>
      )}
      {index === 1 && (
        <>
          <rect x="7" y="6" width="18" height="21" rx="2" />
          <path d="M12 6V4h8v2M11 12h10M11 17h10M11 22h6" />
        </>
      )}
      {index === 2 && (
        <Rocket aria-hidden="true" />
      )}
      {index === 3 && (
        <ChartNoAxesCombined aria-hidden="true" />
      )}
    </svg>
  );
}

export default function StrategyJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const shadowRef = useRef<SVGPathElement>(null);
  const gradient = `strategy-${useId().replace(/:/g, '')}`;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    const path = pathRef.current;
    const shadow = shadowRef.current;
    if (!section || !panel || !path || !shadow) return;
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
        const halos = gsap.utils.toArray<HTMLElement>('.strategy-halo', section);
        if (!conditions?.desktop) {
          cards.forEach((card, index) => {
            const reveal = gsap.timeline({
              scrollTrigger: {
                id: `strategy-mobile-${index}`,
                trigger: card,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
              },
            });
            reveal
              .from(markers[index], {
                scale: 0,
                autoAlpha: 0,
                duration: 0.45,
                ease: 'back.out(1.7)',
              })
              .from(
                connectors[index],
                { scaleX: 0, transformOrigin: 'left center', duration: 0.35 },
                0.15,
              )
              .from(
                card,
                { y: 25, autoAlpha: 0, scale: 0.98, duration: 0.7, ease: 'power3.out' },
                0.25,
              );
          });
          return;
        }

        const length = path.getTotalLength();
        gsap.set([path, shadow], { strokeDasharray: length, strokeDashoffset: length });
        gsap.set(headingRef.current, { opacity: 0, y: 30 });
        gsap.set(cards, { opacity: 0, y: 35, scale: 0.97 });
        gsap.set(connectors, { scaleY: 0, transformOrigin: 'bottom center' });
        gsap.set(markers, { scale: 0, opacity: 0 });
        gsap.set(halos, { opacity: 0, scale: 0.9 });

        // One reversible timeline owns the road and every stage. No other
        // page reveal targets this island's headings or cards.
        const tl = gsap.timeline({
          scrollTrigger: {
            id: 'strategy-journey',
            trigger: section,
            start: 'top top',
            end: '+=300%',
            pin: panel,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.to(headingRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, 0);
        const arrivals = [1.2, 3.5, 5.7, 7.7];
        let previous = 0.55;
        anchors.forEach((anchor, index) => {
          // Align the reveal with the actual distance along the Bézier, rather
          // than an assumed linear horizontal percentage.
          let nearest = 0;
          let distance = Infinity;
          for (let sample = 0; sample <= 1200; sample++) {
            const at = (length * sample) / 1200;
            const point = path.getPointAtLength(at);
            const delta = Math.hypot(point.x - anchor.x, point.y - anchor.y);
            if (delta < distance) {
              distance = delta;
              nearest = at;
            }
          }
          const arrival = arrivals[index];
          tl.to(
            [path, shadow],
            { strokeDashoffset: length - nearest, duration: arrival - previous, ease: 'none' },
            previous,
          )
            .to(
              markers[index],
              { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.7)' },
              arrival,
            )
            .to(halos[index], { opacity: 0.14, scale: 1.3, duration: 0.3 }, arrival)
            .to(halos[index], { opacity: 0, scale: 1.6, duration: 0.65 }, arrival + 0.3)
            .to(connectors[index], { scaleY: 1, duration: 0.4, ease: 'power2.out' }, arrival + 0.4)
            .to(
              cards[index],
              { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' },
              arrival + 0.8,
            );
          previous = arrival;
        });
        tl.to([path, shadow], { strokeDashoffset: 0, duration: 1, ease: 'none' }, previous).to(
          {},
          { duration: 1.6 },
          9,
        );
      },
      section,
    );
    // Hydration can follow the site's Lenis setup; refresh existing geometry
    // after the pin spacer is installed without creating another scroll runtime.
    let disposed = false;
    const refresh = requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    document.fonts.ready.then(() => {
      if (!disposed) ScrollTrigger.refresh();
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
      <div className="strategy-panel" ref={panelRef}>
        <div className="strategy-heading" ref={headingRef}>
          <p>06 / Como trabalhamos</p>
          <h2 id="strategy-title">
            Assumindo a <strong>Estratégia</strong>
          </h2>
        </div>
        <div className="strategy-scene">
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
            <path ref={shadowRef} className="strategy-road-shadow" d={road} />
            <path
              ref={pathRef}
              className="strategy-road-main"
              d={road}
              stroke={`url(#${gradient})`}
            />
          </svg>
          <svg
            className="strategy-road strategy-road--vertical"
            viewBox="0 0 90 1200"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`${gradient}-vertical`} x1="0" y1="0" x2="0" y2="1">
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
                  <span className="strategy-halo" />
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
