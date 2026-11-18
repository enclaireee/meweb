'use client';
// b2: the mountain face unfolds like origami doors and warm light floods out. Choreography from ../transitions.
// Text: "Education" set huge across the foot of the mountain, behind the ground sheet; the degree (then, once the doors
// open, the course list) sits in the dark sky on the left. Both are shared-slot entries with masked rows.
import type { BeatDef, Comp, LayerDef, Track } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b2-first-fold/manifest.json';
import { Particles } from '../Ambient';
import { useLang, useT } from '../lang';
import { At, Kicker, Ln, Lines, SectionHeading } from '../SceneText';
import { onLayer, world } from '../transitions';

const SCREENS = 2;
const s = scenes.b2;
const D = 0.05;
const DEG = { a: 0.17, w: 0.22 }; // degree: after the gates part
const CRS = { a: 0.47, w: 0.17 }; // courses: once the doors are open, gone before the dive

function Sky() {
  const t = useT();
  return (
    <div aria-hidden className="beat-text grid text-[#f3ead8]">
      <At a={DEG.a} d={D} w={DEG.w} k="one" className="col-start-1 row-start-1 flex flex-col gap-[1.4vh]">
        <Ln i={0}><Kicker slug="b2-first-fold" /></Ln>
        <span className="block font-display text-title font-semibold text-balance">
          <Lines text={t(s.degree)} i={1} />
        </span>
        <Ln i={3}><span className="block text-label font-semibold tracking-[0.3em] uppercase">{s.school}</span></Ln>
        <Ln i={4}><span className="block font-display text-lead italic">{t(s.period)}</span></Ln>
      </At>
      <At a={CRS.a} d={D} w={CRS.w} k="one" className="col-start-1 row-start-1 flex flex-col gap-[1.2vh]">
        <Ln i={0}><span className="block text-label font-semibold tracking-[0.3em] uppercase">{t(s.coursesLabel)}</span></Ln>
        <ol className="flex flex-col">
          {s.courses.map((c, i) => (
            <li key={i} className="border-t border-current/25 py-[0.9vh] last:border-b">
              <Ln i={i + 1}>
                <span className="flex items-baseline gap-4">
                  <span className="text-label tracking-[0.2em] tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display text-lead leading-tight font-semibold">{t(c)}</span>
                </span>
              </Ln>
            </li>
          ))}
        </ol>
      </At>
    </div>
  );
}
const text = <Sky />;

// "Pendidikan" is longer than "Education": a smaller size keeps it inside its rect.
function Heading({ en, id }: { en: string; id: string }) {
  const { lang } = useLang();
  return <SectionHeading slug="b2-first-fold" size={lang === 'id' ? id : en} className="text-[#ece4d2]" />;
}
const heading = <Heading en="text-[13.5cqw]" id="text-[12.5cqw]" />;
const headingP = <Heading en="text-[12.5cqw]" id="text-[11.5cqw]" />;

// Flaps hinge on their outer edge (pop-up book); the top flap lifts away.
const open = (deg: number): LayerDef['track'] => [{ at: 0.18, rotateY: 0 }, { at: 0.56, rotateY: deg, ease: 'inOut' }];
const crack: LayerDef['track'] = [{ at: 0.1, opacity: 0 }, { at: 0.28, opacity: 1, ease: 'out' }];
const extra: Record<string, LayerDef> = {};
for (const p of ['', '-p']) {
  extra[`flap-l${p}`] = { origin: '0% 50%', track: open(-72) };
  extra[`flap-l-back${p}`] = { origin: '0% 50%', track: open(-72) };
  extra[`flap-r${p}`] = { origin: '100% 50%', track: open(72) };
  extra[`flap-r-back${p}`] = { origin: '100% 50%', track: open(72) };
  extra[`flap-top${p}`] = { track: [{ at: 0.18, y: 0, opacity: 1 }, { at: 0.48, y: -180, opacity: 0, ease: 'in' }] };
  extra[`seam-light${p}`] = { track: crack };
}
extra['seam-glow'] = { track: crack };
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, close: c === 'desktop' ? 430 : 260, extra });
const desktop = comp('desktop', [1060, 560]);
const portrait = comp('portrait', [560, 910]);

const headT: Track = [{ at: 0.1, y: 60, opacity: 0 }, { at: 0.115, y: 55, opacity: 1 }, { at: 0.22, y: 0, ease: 'out' }, { at: 0.6, y: 0 }, { at: 0.7, y: 50, opacity: 1, ease: 'in' }, { at: 0.7005, y: 50, opacity: 0 }];
// Dust motes catch the light that floods out of the seam.
const motesT: Track = [{ at: 0.3, opacity: 0 }, { at: 0.5, opacity: 1 }, { at: 0.64, opacity: 1 }, { at: 0.74, opacity: 0 }];
const motes = (c: typeof desktop, id: string, rect: { x: number; y: number; w: number; h: number }): OverlayLite[] => [
  { ...onLayer(c, id, rect, <Particles sprite="mote" kind="rise" n={8} seed={7} size={[0.5, 1]} lite />, { track: motesT }) },
  { ...onLayer(c, id, rect, <Particles sprite="mote" kind="rise" n={8} seed={17} size={[0.4, 0.8]} />, { track: motesT }), highOnly: true },
];
type OverlayLite = NonNullable<BeatDef['desktop']['overlays']>[number];

export const b2FirstFold: BeatDef = {
  slug: 'b2-first-fold',
  screens: SCREENS,
  rests: [DEG.a + (D + DEG.w) / 2, CRS.a + (D + CRS.w) / 2], // degree, then courses
  manifest,
  desktop: {
    ...desktop,
    split: 'ground',
    overlays: [
      onLayer(desktop, 'ground', { x: 380, y: 620, w: 640, h: 325 }, heading, { behind: true, track: headT }),
      ...motes(desktop, 'seam-glow', { x: 800, y: 250, w: 520, h: 600 }),
      { node: text, className: 'left-[6vw] top-[13vh] w-[min(29vw,32rem)]' },
    ],
  },
  portrait: {
    ...portrait,
    split: 'ground-p',
    overlays: [
      onLayer(portrait, 'ground-p', { x: 170, y: 1180, w: 740, h: 240 }, headingP, { behind: true, track: headT }),
      ...motes(portrait, 'seam-glow', { x: 250, y: 600, w: 620, h: 600 }),
      { node: text, className: 'left-[8vw] right-[8vw] top-[8svh]' },
    ],
  },
};
