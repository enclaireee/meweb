'use client';
// b1: the paper mountain up close. Choreography from ../transitions. Hero: the crease lines surface on the face.
// Text: "About" set huge in the sky behind the mountain's shoulder, then one editorial sentence that rises in line by
// line (masked rows) and leaves the same way. Idle: stars twinkle, the mist drifts.
import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import type { BeatDef, Comp, LayerDef, Track } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b1-approach/manifest.json';
import { Particles } from '../Ambient';
import { useLang, useT } from '../lang';
import { At, Kicker, Ln, SectionHeading } from '../SceneText';
import { onLayer, world } from '../transitions';

const SCREENS = 1.4;
const A = 0.2, W = 0.42; // sentence slot (local t): after the gates part, gone before the dive

/** The sentence as masked rows: every word is a clip mask, words on one rendered line share a cascade index.
 *  *Emphasis* words are italic. Line indices are measured on mount/resize (never per frame). */
function Sentence() {
  const t = useT();
  const box = useRef<HTMLSpanElement>(null);
  const str = t(scenes.b1.sentence);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const assign = () => {
      let top = NaN, row = -1;
      for (const w of el.querySelectorAll<HTMLElement>('[data-w]')) {
        if (w.offsetTop !== top) { top = w.offsetTop; row++; }
        w.style.setProperty('--i', String(1 + row));
      }
    };
    assign();
    const ro = new ResizeObserver(assign);
    ro.observe(el);
    return () => ro.disconnect();
  }, [str]);
  const words = str.split('*').flatMap((chunk, c) => chunk.split(' ').filter(Boolean).map((w) => ({ w, on: c % 2 === 1 })));
  return (
    <span ref={box} className="block">
      {words.map(({ w, on }, j) => (
        <span key={j}>
          <span data-w="" className="ln ln-w" style={{ '--i': 1 } as CSSProperties}>
            <span className={`ln-in ${on ? 'italic text-[#ffdcaa]' : ''}`}>{w}</span>
          </span>
          {j < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}
const text = (
  <At a={A} d={0.05} w={W} k="one" className="block w-[min(43vw,40rem)] portrait:w-[84vw]">
    <div aria-hidden className="beat-text flex flex-col gap-4">
      <Ln i={0}><Kicker slug="b1-approach" /></Ln>
      <p className="font-display text-[clamp(1.4rem,2.7vw,3rem)] leading-[1.14] portrait:text-[clamp(1.3rem,5.4vw,2.2rem)]">
        <Sentence />
      </p>
    </div>
  </At>
);
// "Tentang" is longer than "About": a smaller size keeps it clear of the right-hand sheet.
function Heading({ en, id, align }: { en: string; id: string; align?: 'center' }) {
  const { lang } = useLang();
  return <SectionHeading slug="b1-approach" size={lang === 'id' ? id : en} align={align} className="text-[#ece4d2]" />;
}
const heading = <Heading en="text-[24cqw]" id="text-[19cqw]" />;
const headingP = <Heading en="text-[21cqw]" id="text-[16cqw]" align="center" />;

const extra: Record<string, LayerDef> = {};
for (const s of ['', '-p']) {
  extra[`creases${s}`] = { track: [{ at: 0.12, opacity: 0 }, { at: 0.55, opacity: 1, ease: 'inOut' }] };
  extra[`clouds${s}`] = { track: [{ at: 0, x: 0 }, { at: 1, x: -80 }] };
}
extra.mist = { live: { className: 'amb-drift-c', style: { '--amb-dur': '30s', '--amb-x': '50px' } as CSSProperties } };
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, close: c === 'desktop' ? 430 : 260, extra });
const desktop = comp('desktop', [960, 560]);
const portrait = comp('portrait', [540, 910]);

// The heading rises in once the gates part and sinks away before the dive.
const headT: Track = [{ at: 0.1, y: 50, opacity: 0 }, { at: 0.115, y: 45, opacity: 1 }, { at: 0.22, y: 0, ease: 'out' }, { at: 0.6, y: 0 }, { at: 0.7, y: 40, opacity: 1, ease: 'in' }, { at: 0.705, y: 40, opacity: 0 }];
const starsT: Track = [{ at: 0, opacity: 1 }, { at: 0.6, opacity: 1 }, { at: 0.72, opacity: 0 }];
const stars = (c: typeof desktop, sky: string, rect: { x: number; y: number; w: number; h: number }) => [
  { ...onLayer(c, sky, rect, <Particles sprite="star-glint" n={14} kind="twinkle" seed={21} size={[0.7, 1.4]} lite />, { behind: true, track: starsT }) },
  { ...onLayer(c, sky, rect, <Particles sprite="star-glint" n={14} kind="twinkle" seed={34} size={[0.5, 1]} dur={[3.5, 6]} />, { behind: true, track: starsT }), highOnly: true },
];

export const b1Approach: BeatDef = {
  slug: 'b1-approach',
  screens: SCREENS,
  manifest,
  desktop: {
    ...desktop,
    split: 'face-back',
    overlays: [
      ...stars(desktop, 'sky', { x: 100, y: 20, w: 1700, h: 420 }),
      onLayer(desktop, 'face-back', { x: 335, y: 100, w: 560, h: 290 }, heading, { behind: true, track: headT }),
      { node: text, className: 'left-[8vw] top-[38vh]' },
    ],
  },
  portrait: {
    ...portrait,
    split: 'face-back-p',
    overlays: [
      ...stars(portrait, 'sky', { x: 100, y: 120, w: 880, h: 600 }),
      onLayer(portrait, 'face-back-p', { x: 130, y: 440, w: 300, h: 150 }, headingP, { behind: true, track: headT }),
      { node: text, className: 'left-[8vw] bottom-[8svh]' },
    ],
  },
};
