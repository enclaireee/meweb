'use client';
// b2: the mountain face unfolds like origami doors and warm light floods out. Choreography from ../transitions.
import type { BeatDef, Comp, LayerDef } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b2-first-fold/manifest.json';
import { useT } from '../lang';
import { At, Kicker, seq } from '../SceneText';
import { world } from '../transitions';

const SCREENS = 3;
const s = scenes.b2;

// Text: kept off the mountain, in the dark sky on the left on a soft fade. The degree first; once the
// doors open it gives way to the course list in the same spot. Both stacked in one grid cell.
function Sky() {
  const t = useT();
  const at = seq(s.courses.length, 0.44, 0.58);
  return (
    <div aria-hidden className="beat-text grid text-[#f3ead8]">
      <At a={0.05} d={0.05} w={0.31} k="one" className="sky-fade col-start-1 row-start-1 flex flex-col gap-[1.6vh]">
        <Kicker slug="b2-first-fold" />
        <p className="font-display text-[clamp(2.4rem,3.6vw,4.4rem)] leading-[0.98] text-balance portrait:text-[clamp(2.2rem,10vw,3.4rem)]">{t(s.degree)}</p>
        <p className="text-[0.8rem] tracking-[0.35em] uppercase">{s.school}</p>
        <p className="font-display text-[clamp(1rem,1.3vw,1.35rem)] italic opacity-85">{t(s.period)}</p>
      </At>
      <At a={0.42} d={0.05} w={0.36} k="one" className="sky-fade col-start-1 row-start-1 flex flex-col gap-[1.2vh]">
        <p className="text-[0.7rem] tracking-[0.35em] uppercase opacity-80">{t(s.coursesLabel)}</p>
        <ol className="flex flex-col">
          {s.courses.map((c, i) => (
            <li key={i} className="border-t border-current/25 py-[1vh] last:border-b">
              <At a={at[i]!} d={0.04} className="flex items-baseline gap-4">
                <span className="text-[0.7rem] tracking-[0.2em] tabular-nums opacity-70">{String(i + 1).padStart(2, '0')}</span>
                <span className="font-display text-[clamp(1.25rem,1.8vw,2rem)] leading-tight portrait:text-[clamp(1.15rem,5.4vw,1.6rem)]">{t(c)}</span>
              </At>
            </li>
          ))}
        </ol>
      </At>
    </div>
  );
}
const text = <Sky />;

// Flaps hinge on their outer edge (pop-up book); the top flap lifts away.
const open = (deg: number): LayerDef['track'] => [{ at: 0.22, rotateY: 0 }, { at: 0.6, rotateY: deg, ease: 'inOut' }];
const crack: LayerDef['track'] = [{ at: 0.12, opacity: 0 }, { at: 0.3, opacity: 1, ease: 'out' }];
const extra: Record<string, LayerDef> = {};
for (const s of ['', '-p']) {
  extra[`flap-l${s}`] = { origin: '0% 50%', track: open(-72) };
  extra[`flap-l-back${s}`] = { origin: '0% 50%', track: open(-72) };
  extra[`flap-r${s}`] = { origin: '100% 50%', track: open(72) };
  extra[`flap-r-back${s}`] = { origin: '100% 50%', track: open(72) };
  extra[`flap-top${s}`] = { track: [{ at: 0.22, y: 0, opacity: 1 }, { at: 0.55, y: -180, opacity: 0, ease: 'in' }] };
  extra[`seam-light${s}`] = { track: crack };
}
extra['seam-glow'] = { track: crack };
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, extra });
const desktop = comp('desktop', [1060, 560]);
const portrait = comp('portrait', [560, 910]);

export const b2FirstFold: BeatDef = {
  slug: 'b2-first-fold',
  screens: SCREENS,
  manifest,
  desktop: { ...desktop, overlays: [{ node: text, className: 'left-[6vw] top-[13vh] w-[min(27vw,30rem)]' }] },
  portrait: { ...portrait, overlays: [{ node: text, className: 'left-[8vw] right-[8vw] top-[8svh]' }] },
};
