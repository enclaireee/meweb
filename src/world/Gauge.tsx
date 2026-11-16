'use client';
// Section gauge (Build decisions c, item 7): a dotted line going down "into the mountain" on the right edge
// (bottom row on portrait), one tick per section, a small warm lantern at the current position. Real navigation:
// an ordered list of buttons that jump to each section with scrollToS. In the projects lane it lists the districts.
// Per frame it writes only the lantern's transform; React state changes only when the section changes.
import { useEffect, useRef, useState } from 'react';
import { beatRanges, scrollToS, subscribeFrame, useLane, type Lane } from '@/engine';
import { ui, type L } from '@/content';
import { mainBeats, projectBeats } from './beats';
import { useT } from './lang';

type Mark = { label: L; s: number; beat: number };

/** Where a jump lands: early in the beat, once its gates have parted and its text has arrived. */
const into = (start: number, screens: number, k: number) => start + screens * k;

function marks(lane: Lane): { list: Mark[]; total: number } {
  const beats = lane === 'main' ? mainBeats : projectBeats;
  const r = beatRanges(beats);
  const total = r.at(-1)?.end ?? 1;
  const at = (beat: number, k = 0.3) => ({ beat, s: beat === 0 ? 0 : into(r[beat]!.start, beats[beat]!.screens, k) });
  const g = ui.gauge;
  const list: Mark[] =
    lane === 'main'
      ? [
          { label: g.top, ...at(0) }, { label: g.about, ...at(1) }, { label: g.education, ...at(2) },
          { label: g.experience, ...at(3) }, { label: g.projects, ...at(5) }, { label: g.skills, ...at(6) },
          { label: g.awards, ...at(7) }, { label: g.leadership, ...at(8) }, { label: g.contact, ...at(9) },
        ]
      : [
          { label: g.shell, ...at(0) }, { label: ui.projects.groups.web, ...at(1, 0.12) },
          { label: ui.projects.groups.data, ...at(2, 0.12) }, { label: ui.projects.groups.hardware, ...at(3, 0.12) },
        ];
  return { list, total };
}

// Module-level: stable identity (the beat arrays are module constants).
const MARKS = { main: marks('main'), projects: marks('projects') };

export function Gauge() {
  const t = useT();
  const lane = useLane();
  const { list, total } = MARKS[lane];
  const [cur, setCur] = useState(0);
  const line = useRef<HTMLDivElement>(null);
  const lamp = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = line.current;
    if (!el) return;
    let len = 0, vertical = true;
    const measure = () => {
      const r = el.getBoundingClientRect();
      vertical = r.height >= r.width;
      len = vertical ? r.height : r.width;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    let last = '';
    const unsub = subscribeFrame((f) => {
      if (f.lane !== lane) return;
      const d = Math.round(Math.min(1, Math.max(0, f.s / total)) * len * 10) / 10;
      const tf = vertical ? `translate3d(0,${d}px,0)` : `translate3d(${d}px,0,0)`;
      if (tf !== last && lamp.current) lamp.current.style.transform = last = tf;
      let i = 0;
      for (let j = 0; j < list.length; j++) if (f.beat >= list[j]!.beat) i = j;
      setCur(i); // bails out when unchanged
    });
    return () => (ro.disconnect(), unsub());
  }, [lane, list, total]);

  return (
    <nav
      data-chrome
      aria-label={t(lane === 'main' ? ui.gauge.label : ui.gauge.lane)}
      className="gauge pointer-events-none fixed z-50 text-[#f3ead8] landscape:top-1/2 landscape:right-[34px] landscape:h-[52vh] landscape:-translate-y-1/2 portrait:inset-x-[16vw] portrait:bottom-[calc(14px+env(safe-area-inset-bottom))] portrait:h-6"
    >
      {/* The dotted line into the mountain, and the lantern riding it. */}
      <div ref={line} aria-hidden className="absolute landscape:inset-y-0 landscape:left-1/2 landscape:w-0 landscape:border-l-2 landscape:border-dotted portrait:inset-x-0 portrait:top-1/2 portrait:h-0 portrait:border-t-2 portrait:border-dotted border-current opacity-55 [filter:drop-shadow(0_1px_2px_rgb(0_0_0/0.7))]" />
      <span ref={lamp} aria-hidden className="absolute top-0 left-0 block landscape:left-1/2 portrait:top-1/2">
        <span className="block size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffd27a] shadow-[0_0_10px_3px_rgb(255_190_100/0.75),0_0_24px_8px_rgb(255_160_70/0.35)]" />
      </span>
      <ol className="absolute inset-0">
        {list.map((m, i) => {
          const pos = `${(m.s / total) * 100}%`;
          const on = i === cur;
          return (
            <li key={i} className="absolute landscape:left-1/2 landscape:top-[var(--pos)] portrait:top-1/2 portrait:left-[var(--pos)]" style={{ ['--pos' as string]: pos }}>
              <button
                type="button"
                aria-current={on ? 'location' : undefined}
                onClick={() => scrollToS(m.s, { smooth: true })}
                className="gauge-tick group pointer-events-auto absolute flex size-7 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#ffd27a]"
              >
                <span aria-hidden className={`block rounded-full bg-current shadow-[0_1px_3px_rgb(0_0_0/0.7)] transition-transform duration-200 motion-reduce:transition-none ${on ? 'size-2 scale-110' : 'size-1.5 opacity-80 group-hover:scale-150'}`} />
                <span className="gauge-label sheet absolute right-full mr-2 rounded-[2px] px-2 py-1 text-label font-semibold tracking-[0.16em] whitespace-nowrap uppercase shadow-[2px_3px_0_rgb(0_0_0/0.35)] portrait:right-auto portrait:bottom-full portrait:mr-0 portrait:mb-2">
                  <span className="sr-only">{t(ui.gauge.jump)} </span>
                  {t(m.label)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
