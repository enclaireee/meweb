'use client';
// b7: the inner mountain unfolds onto dawn (the colour flip). Choreography from ../transitions. Flaps hinge on their outer edge, as in b2.
import type { CSSProperties } from 'react';
import type { BeatDef, Comp, Keyframe, LayerDef } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b7-second-fold/manifest.json';
import whale from '../../../public/art/creatures/whale/manifest.json';
import { Creature } from '../Creature';
import { useLang, useT } from '../lang';
import { At, Kicker, Ln, SectionHeading } from '../SceneText';
import { onLayer, world } from '../transitions';

// Text: the whale's wake. Each award is a glowing mote it leaves on the dark cavern wall, a streak of
// light trailing back toward it, lit one by one as it swims in. The wake bends as it trails off.
const glow = '[text-shadow:0_0_12px_rgb(150_215_255/0.85),0_0_30px_rgb(110_180_255/0.5),0_2px_8px_rgb(0_0_25/0.8)]';
const drift = ['0vw', '3.5vw', '5.5vw', '4.5vw'];
const OUT = 0.68; // awards leave here (the dive starts at 0.727)
function Awards() {
  const t = useT();
  return (
    <div aria-hidden className={`beat-text flex flex-col gap-[3vh] text-[#f2faff] portrait:paper-card portrait:gap-4 portrait:text-[#2a2118] ${glow}`}>
      <At a={0.3} d={0.04} w={OUT - 0.3} k="one" className="block"><Ln i={0}><Kicker slug="b7-second-fold" /></Ln></At>
      <ol className="flex flex-col gap-[3.2vh] portrait:gap-4">
        {scenes.b7.map((a, i) => {
          const at = 0.36 + 0.06 * i;
          return (
            <li key={i} style={{ marginLeft: drift[i] }}>
              <At a={at} d={0.05} w={OUT - at} k="one" className="block">
                <Ln i={0}>
                  <span className="flex items-center gap-4">
                    <span className="relative size-2.5 shrink-0 rounded-full bg-[#eef9ff] shadow-[0_0_10px_3px_rgb(160_220_255/0.9),0_0_28px_8px_rgb(110_180_255/0.45)]">
                      <span className="absolute top-1/2 right-full h-px w-[8vw] origin-right -translate-y-1/2 bg-linear-to-l from-[#c4e8ff] to-transparent [scale:var(--p)_1]" />
                    </span>
                    <span className="font-display text-lead font-semibold leading-[1.05]">{t(a.title)}</span>
                  </span>
                </Ln>
                <Ln i={1}><span className="mt-1 block pl-[1.625rem] text-body leading-snug text-[#d8eeff] portrait:text-[#4a3f5c]">{t(a.detail)}</span></Ln>
              </At>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
const text = <Awards />;
// The engine hides the block (and the heading) outside this window; the rows inside slide in and out.
const shown = (a: number): Keyframe[] => [{ at: a - 0.012, opacity: 0 }, { at: a, opacity: 1 }, { at: OUT + 0.055, opacity: 1 }, { at: OUT + 0.065, opacity: 0 }];
const textT = shown(0.3);
function Head({ p = false }: { p?: boolean }) {
  const { lang } = useLang();
  const size = p ? (lang === 'id' ? 'text-[12.5cqw]' : 'text-[19cqw]') : lang === 'id' ? 'text-[14cqw]' : 'text-[21cqw]';
  return <SectionHeading slug="b7-second-fold" size={size} className="text-[#eef6ff]" />;
}
const head = <Head />;
const headP = <Head p />;
// Creature box of width w whose anchor point sits at (ax, ay); height follows the sprite frame.
const box = (ax: number, ay: number, w: number) => {
  const [cx, cy] = whale.anchor as [number, number];
  const k = w / whale.frame.w;
  return { x: ax - cx * k, y: ay - cy * k, w, h: whale.frame.h * k };
};
const SCREENS = 2.2;
// The whale glides on a wrapper (the engine owns the overlay's transform).
const fish = (
  <div className="amb-glide size-full" style={{ '--amb-x': '26px', '--amb-y': '8px', '--amb-r': '0.7deg', '--amb-dur': '8s' } as CSSProperties}>
    <Creature sheet={whale} ms={1800} />
  </div>
);

const open = (deg: number): LayerDef['track'] => [{ at: 0.14, rotateY: 0 }, { at: 0.5, rotateY: deg, ease: 'inOut' }];
// The crack shows first, then gives way to the flood of dawn as the flaps open.
const crack: LayerDef['track'] = [{ at: 0.06, opacity: 0 }, { at: 0.14, opacity: 1 }, { at: 0.4, opacity: 0, ease: 'in' }];
const cloud = (dur: string, x: string): LayerDef['live'] => ({ className: 'amb-drift', style: { '--amb-dur': dur, '--amb-x': x, '--amb-y': '0px' } as CSSProperties });
const extra: Record<string, LayerDef> = {
  'seam-glow': { track: [{ at: 0.08, opacity: 0 }, { at: 0.4, opacity: 1, ease: 'out' }] },
  mist: { track: [{ at: 0, x: 0 }, { at: 1, x: -80 }] },
};
for (const s of ['', '-p']) {
  extra[`inner-flap-l${s}`] = { origin: '0% 50%', track: open(-75) };
  extra[`inner-flap-r${s}`] = { origin: '100% 50%', track: open(75) };
  extra[`seam-light${s}`] = { track: crack };
  extra[`dust${s}`] = { highOnly: true };
  extra[`clouds-far${s}`] = { live: cloud('48s', '34px') };
  extra[`cloud-sea${s}`] = { live: cloud('64s', '40px') };
}
// Gates close less than the default, so the cavern stays visible between them.
const comp = (c: Comp, focus: [number, number], close: number) => world(manifest, c, SCREENS, { focus, close, extra });
// Revealed once the flaps pass about 40 degrees, then glides.
const glide: LayerDef['track'] = [{ at: 0.3, x: -60, opacity: 0 }, { at: 0.42, x: -20, opacity: 1 }, { at: 0.78, x: 70, opacity: 1 }, { at: 0.86, x: 90, opacity: 0 }];
const desktop = comp('desktop', [760, 520], 380);
const portrait = comp('portrait', [540, 560], 150);

export const b7SecondFold: BeatDef = {
  slug: 'b7-second-fold',
  screens: SCREENS,
  rests: [0.635], // all four awards in, before they leave
  manifest,
  // calm zone is the cavern wall on the right; the heading sits on it, only the near gate column passes in front
  desktop: {
    ...desktop,
    split: 'dust',
    overlays: [
      { node: fish, rect: box(480, 280, 1000), parallax: 0.2, track: glide },
      onLayer(desktop, 'dust', { x: 1090, y: 740, w: 560, h: 200 }, head, { behind: true, track: shown(0.28) }),
      { node: text, className: 'left-[56vw] top-[14vh] w-[min(36vw,40rem)]', track: textT },
    ],
  },
  portrait: {
    ...portrait,
    split: 'dust-p',
    overlays: [
      { node: fish, rect: box(540, 330, 760), parallax: 0.2, track: glide },
      onLayer(portrait, 'dust-p', { x: 170, y: 560, w: 740, h: 180 }, headP, { behind: true, track: shown(0.28) }),
      { node: text, className: 'left-[8vw] right-[8vw] bottom-[7svh]', track: textT },
    ],
  },
};
